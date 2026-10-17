# TEST 03 — James / LVLLVL C64 original 1:1

**Objetivo:** reproducir exactamente la aplicación `https://www.lvllvl.com/c64/`, antes de eliminar NADA ni añadir modificaciones RicOS.

**Referencia inmutable:** `jaammees/lvllvl`, commit `b528e4c1d38faeadb0e24eb619705e4f0b8ab899` (26 nov 2023).

## Esta vez NO hay UI recreada
Se emplean los archivos de `dist/` originales completos (555 entradas / 17,6 MB):
- `c64/index.html` ORIGINAL (sin editar).
- `js/main.js`, `js/libs.js`, `js/html/htmlcache.js`, `css/style.css` ORIGINALES.
- `c64/c64/c64.js`, `c64/c64/c64.wasm`, bibliotecas y recursos ORIGINALES.
- Otros **todos** los archivos de `dist` están incluidos, incluso recursos PETSCII que sobren.
- El original completo (incluidos los `src/`) queda referenciado como submódulo `vendor/lvllvl`.

La URL de usuario raíz usa un HTML de redirección a `./c64/` para iniciar directamente el modo C64. **No se modifica ningún archivo bajo `c64/`**. El `dist/index.html` original se conserva, idéntico, como `original-lvllvl-index.html`.

## Construir
```bash
git clone --recurse-submodules https://github.com/serigrafiamdp-web/RICOS-C64-MOD-JAMES-C64-WEB-EMULATOR-.git
cd RICOS-C64-MOD-JAMES-C64-WEB-EMULATOR-
bash scripts/build-original.sh site
python3 -m http.server 8080 -d site
```
Abrir `http://localhost:8080/c64/`.

GitHub Actions realiza el mismo procedimiento, verifica los 555 archivos byte por byte y genera un ZIP descargable en los artifacts del workflow.

## Publicación GitHub Pages

El workflow `.github/workflows/james-original-pages.yml` prepara la distribución fiel. Para activarlo como web, en **Settings → Pages → Build and deployment → Source**, seleccionar **GitHub Actions** en vez de `Deploy from a branch`. El workflow se ejecuta automáticamente en `main` cuando cambian sus archivos, y se puede disparar desde **Actions → TEST 03 - Original James C64 1to1 → Run workflow**.

Dirección esperada tras publicación:
- `https://serigrafiamdp-web.github.io/RICOS-C64-MOD-JAMES-C64-WEB-EMULATOR-/` (redirige a C64)
- `https://serigrafiamdp-web.github.io/RICOS-C64-MOD-JAMES-C64-WEB-EMULATOR-/c64/` (archivo original idéntico de James)

## Matriz PASS / FAIL

- [ ] Se ve barra original C64, Sound, Joystick, Size, Speed, View, Assembler, Share.
- [ ] Los 57 ítems originales activos del commit están presentes (no agregar opciones comentadas).
- [ ] Inicio C64 BASIC, fondo, tamaño, color, contador de drive y joystick reproducen la referencia.
- [ ] Los desplegables abren y cierran idénticamente.
- [ ] Load PRG / Attach D64 / Autostart D64 / CRT.
- [ ] Audio 6581 / 8580, velocidad, tamaños, PAL, joystick y ratón.
- [ ] View despliega y colapsa los paneles nativos sin inventar otros.
- [ ] Assembler y Share muestran sus menús y funcionan en lo posible.
- [ ] Se prueban snapshots, archivos y ejecución; no 404 ni excepciones JS.

**La copia binaria exacta puede verificarse automáticamente. El PASS visual/funcional no se puede declarar sólo por copiar archivos**: hace falta probarla contra `lvllvl.com/c64/` en navegador. Algunos servicios remotos (login Firebase/GitHub, Share) dependen del dominio y credenciales originales; puede que no funcionen al publicarse en otro dominio. El código público de James no incluye licencia general evidente; verificar autorización para su redistribución antes de dar por aprobada su publicación.

## Regresión

- `backup/test-02-ui`: TEST 02 antiguo (FAIL de paridad).
- `backup/test-01-player`: primer reproductor (FAIL de paridad).
- Ninguno debe usarse como referencia para nuevos diseños.
