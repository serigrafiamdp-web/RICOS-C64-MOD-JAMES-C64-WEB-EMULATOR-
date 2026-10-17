/* RicOS CRT05 — physically pixel-aligned scanlines, exactly 1 device pixel
   dark / 1 device pixel clear. No CSS gradient, no variable pixel rounding.
   The original James C64 renderer, menus and WASM remain unchanged. */
(function () {
  "use strict";

  var enabled = false;
  var installed = false;
  var item = null;
  var picture = null;
  var holder = null;
  var overlay = null;
  var tracking = null;
  var installPoll = null;
  var attempts = 0;
  var lastDpr = 0;

  function paint() {
    if (!overlay) return;
    var ctx = overlay.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    // Integer DEVICE pixels: no fractional line widths or gradient sampling.
    for (var y = 0; y < overlay.height; y += 2) {
      ctx.fillRect(0, y, overlay.width, 1);
    }
  }

  function align() {
    if (!enabled || !overlay || !picture || !holder) return;
    var bounds = picture.getBoundingClientRect();
    var holderBounds = holder.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    var dpr = window.devicePixelRatio || 1;
    var pxLeft = Math.round(bounds.left * dpr);
    var pxTop = Math.round(bounds.top * dpr);
    var pxRight = Math.round(bounds.right * dpr);
    var pxBottom = Math.round(bounds.bottom * dpr);
    var w = Math.max(1, pxRight - pxLeft);
    var h = Math.max(1, pxBottom - pxTop);

    // Align the overlay's actual screen origin to an integer physical pixel.
    overlay.style.left = (pxLeft / dpr - holderBounds.left) + "px";
    overlay.style.top = (pxTop / dpr - holderBounds.top) + "px";
    overlay.style.width = (w / dpr) + "px";
    overlay.style.height = (h / dpr) + "px";

    // Backing bitmap is in real physical pixels, never scaled to source rows.
    if (overlay.width !== w || overlay.height !== h || lastDpr !== dpr) {
      lastDpr = dpr;
      overlay.width = w;
      overlay.height = h;
      paint();
    }
  }

  function prepare() {
    if (!window.g_app || !g_app.c64Debugger) return false;
    picture = g_app.c64Debugger.canvas ||
      document.getElementById("c64DebuggerCanvas");
    if (!picture) return false;
    holder = document.getElementById("c64DebuggerCanvasHolder") ||
      picture.parentElement;
    if (!holder) return false;

    if (!overlay) {
      overlay = document.createElement("canvas");
      overlay.id = "ricos-crt05-lines";
      overlay.setAttribute("aria-hidden", "true");
      overlay.style.cssText =
        "position:absolute;pointer-events:none;display:none;" +
        "padding:0;margin:0;border:0;image-rendering:pixelated";
      picture.insertAdjacentElement("afterend", overlay);
    }
    return true;
  }

  function toggle() {
    enabled = !enabled;
    if (item) item.setChecked(enabled);
    if (enabled && prepare()) {
      overlay.style.display = "block";
      align();
      // Keep lines aligned after resize, C64 Size menu or browser zoom.
      if (tracking) clearInterval(tracking);
      tracking = setInterval(align, 200);
    } else {
      if (tracking) clearInterval(tracking);
      tracking = null;
      if (overlay) overlay.style.display = "none";
    }
  }

  function install() {
    if (installed) return true;
    if (!window.g_app || !g_app.menuBar || !g_app.c64Debugger) return false;
    var menus = g_app.menuBar.menus;
    if (!menus || !menus.length) return false;

    var c64Menu = null;
    for (var i = 0; i < menus.length; i++) {
      var element = document.getElementById(menus[i].menuBarItemId);
      if (menus[i].label === "C64" && element &&
          element.classList.contains("ui-menu-c64")) {
        c64Menu = menus[i];
        break;
      }
    }
    if (!c64Menu) return false;

    item = c64Menu.addItem({
      label: "CRT Scanlines (CRT05)",
      id: "ricos-crt05-scanlines",
      checked: false
    });
    item.on("click", toggle);
    installed = true;
    console.info("[RicOS CRT05] Pixel-perfect physical scanlines ready; default OFF.");
    return true;
  }

  function tryInstall() {
    if (install() || ++attempts >= 150) clearInterval(installPoll);
  }

  installPoll = setInterval(tryInstall, 100);
  tryInstall();
})();
