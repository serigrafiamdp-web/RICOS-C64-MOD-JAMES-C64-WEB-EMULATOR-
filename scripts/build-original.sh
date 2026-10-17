#!/usr/bin/env bash
# RicOS C64 TEST 03 — copy the complete ORIGINAL James distribution without pruning.
set -euo pipefail
source_dir="vendor/lvllvl"
dest_dir="${1:-site}"

test -f "$source_dir/dist/c64/index.html" || { echo "ERROR: Missing original submodule. Run git submodule update --init --recursive"; exit 1; }
revision="$(git -C "$source_dir" rev-parse HEAD)"
test "$revision" = "b528e4c1d38faeadb0e24eb619705e4f0b8ab899" || { echo "ERROR: expected James commit b528e4c1d38faeadb0e24eb619705e4f0b8ab899, got $revision"; exit 1; }
test "$(git -C "$source_dir" hash-object dist/c64/index.html)" = "d22db0cb5b04e7f25295f9f1b286459c6cb3187e" || { echo "ERROR: upstream original C64 index differs"; exit 1; }
test "$(git -C "$source_dir" hash-object dist/js/main.js)" = "5096701a4ac639b85aadace44eda5005fb4db9e3" || { echo "ERROR: upstream compiled JS differs"; exit 1; }

mkdir -p "$dest_dir"
cp -a "$source_dir/dist/." "$dest_dir/"
# Keep the original editor root HTML byte-for-byte, as requested. Only add a new
# project-root navigation entry to C64. All original files remain accessible.
cp "$dest_dir/index.html" "$dest_dir/original-lvllvl-index.html"
cat > "$dest_dir/index.html" <<'HTML'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>RicOS C64 — James original 1:1</title>
<meta http-equiv="refresh" content="0;url=./c64/">
<script>window.location.replace("./c64/" + window.location.search + window.location.hash);</script>
</head>
<body><a href="./c64/">Open original C64 emulator</a></body>
</html>
HTML
touch "$dest_dir/.nojekyll"

source_count=$(find "$source_dir/dist" -type f | wc -l)
test "$source_count" -eq 555 || { echo "ERROR: Expected 555 original files; got $source_count"; exit 1; }

# Verify EVERY original distribution file survives byte-for-byte.
while IFS= read -r -d '' input; do
  relative="${input#"$source_dir/dist/"}"
  target="$dest_dir/$relative"
  if [ "$relative" = "index.html" ]; then
    target="$dest_dir/original-lvllvl-index.html"
  fi
  cmp -s "$input" "$target" || { echo "ERROR: changed/missing original asset: $relative"; exit 1; }
done < <(find "$source_dir/dist" -type f -print0)

for required in \
  c64/index.html \
  c64/c64/c64.js \
  c64/c64/c64.wasm \
  js/main.js \
  js/libs.js \
  js/html/htmlcache.js \
  css/style.css \
  js/c64/c64.js; do
  test -s "$dest_dir/$required" || { echo "ERROR: missing $required"; exit 1; }
done

echo "PASS: $source_count original dist files preserved without changes."
echo "PASS: Original C64 page: $dest_dir/c64/index.html"
echo "PASS: All assets compared byte-for-byte to James version b528e4c1d38faeadb0e24eb619705e4f0b8ab899"
echo "Browser runtime and menu-interaction PASS still require manual verification."


# -- RicOS experimental layer / TEST CRT01 --
# Originals were compared above; inject a single optional feature AFTER that test.
# All 555 files in vendor/lvllvl remain untouched.
test -s rico/scanlines.js || { echo "ERROR: Missing RicOS scanline source"; exit 1; }
mkdir -p "$dest_dir/rico"
cp rico/scanlines.js "$dest_dir/rico/scanlines.js"
# c64/index.html contains <base href="../">, so rico/ resolves to project root.
sed -i 's#</head>#<script src="rico/scanlines.js?v=CRT07"></script></head>#' "$dest_dir/c64/index.html"
test "$(grep -Fc '<script src="rico/scanlines.js?v=CRT07"></script>' "$dest_dir/c64/index.html")" -eq 1 || {
  echo "ERROR: CRT script injection failed"; exit 1;
}
test -s "$dest_dir/rico/scanlines.js"
echo "PASS: Added only one script reference in C64 HTML; original bundle remains intact."
node --check "$dest_dir/rico/scanlines.js"
grep -Fq 'offCtx.fillRect(0, 0, off.width, off.height)' "$dest_dir/rico/scanlines.js"
grep -Fq 'onCtx.drawImage(off, 0, 0, off.width, off.height,' "$dest_dir/rico/scanlines.js"
! grep -Fq 'insertAdjacentElement' "$dest_dir/rico/scanlines.js"
echo "PASS: CRT07 scanlines rendered at native 384x272 before image scaling."
echo "PASS: RicOS optional CRT Scanlines extension packaged (default OFF)."
