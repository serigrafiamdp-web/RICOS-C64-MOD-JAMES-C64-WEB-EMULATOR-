/* RicOS CRT07 — scanlines composited in James' 384x272 native frame BEFORE
   browser display scaling. No DOM overlay or final-canvas pixel stripes.
   Original renderer, menu system, WASM and source are not modified. */
(function () {
  "use strict";

  var enabled = false;
  var installed = false;
  var item = null;
  var originalRedraw = null;
  var cachedOffscreenContext = null;
  var stripePattern = null;
  var poll = null;
  var attempts = 0;

  function getPattern(ctx) {
    if (cachedOffscreenContext === ctx && stripePattern) return stripePattern;

    var tile = document.createElement("canvas");
    tile.width = 1;
    tile.height = 2;
    var tileCtx = tile.getContext("2d", { alpha: true });
    var pixels = tileCtx.createImageData(1, 2);
    pixels.data[3] = 90;  // Fine, soft black on one source raster row.
    tileCtx.putImageData(pixels, 0, 0);

    cachedOffscreenContext = ctx;
    stripePattern = ctx.createPattern(tile, "repeat");
    return stripePattern;
  }

  function drawPreScale(instance) {
    if (!enabled || instance.type === "compact") return;
    var off = instance.offscreenCanvas;
    var offCtx = instance.offscreenContext;
    var on = instance.canvas;
    var onCtx = instance.context;
    if (!off || !offCtx || !on || !onCtx || !instance.imageData) return;

    var pattern = getPattern(offCtx);
    if (!pattern) return;

    // Draw lines at EXACT native source rows, with no display-pixel phase.
    offCtx.save();
    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.fillStyle = pattern;
    offCtx.fillRect(0, 0, off.width, off.height);
    offCtx.restore();

    // Reuse James' own final-image scaling, exactly the same coordinates.
    onCtx.drawImage(off, 0, 0, off.width, off.height,
                    0, 0, on.width, on.height);

    // Preserve the original native info/grid and mouse overlays.
    if (instance.grid && typeof instance.drawGrid === "function") {
      instance.drawGrid();
    }
    if (instance.mouseX !== false && instance.mouseY !== false &&
        typeof instance.drawMousePosition === "function") {
      instance.drawMousePosition();
    }
  }

  function toggle() {
    enabled = !enabled;
    if (item) item.setChecked(enabled);
    if (window.g_app && g_app.c64Debugger &&
        typeof g_app.c64Debugger.redraw === "function") {
      g_app.c64Debugger.redraw();
    }
  }

  function install() {
    if (installed) return true;
    if (!window.g_app || !g_app.menuBar || !g_app.c64Debugger ||
        !window.C64Debugger || !C64Debugger.prototype ||
        typeof C64Debugger.prototype.redraw !== "function") return false;

    var menus = g_app.menuBar.menus;
    if (!menus || !menus.length) return false;
    var c64Menu = null;
    for (var i = 0; i < menus.length; i++) {
      var menuElement = document.getElementById(menus[i].menuBarItemId);
      if (menus[i].label === "C64" && menuElement &&
          menuElement.classList.contains("ui-menu-c64")) {
        c64Menu = menus[i];
        break;
      }
    }
    if (!c64Menu) return false;

    originalRedraw = C64Debugger.prototype.redraw;
    C64Debugger.prototype.redraw = function () {
      var result = originalRedraw.apply(this, arguments);
      drawPreScale(this);
      return result;
    };

    item = c64Menu.addItem({
      label: "CRT Scanlines (CRT07)",
      id: "ricos-crt07-scanlines",
      checked: false
    });
    item.on("click", toggle);
    installed = true;
    console.info("[RicOS CRT07] Pre-scale original raster scanlines installed; OFF.");
    return true;
  }

  function tryInstall() {
    if (install() || ++attempts >= 150) clearInterval(poll);
  }
  poll = setInterval(tryInstall, 100);
  tryInstall();
})();
