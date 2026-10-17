/* RicOS CRT06 — native C64 display canvas scanlines; NO overlay layer.
   Fixed 1 internal framebuffer pixel dark / 1 transparent.
   Original James C64 source, WASM, menu UI and presentation scale unmodified. */
(function () {
  "use strict";

  var enabled = false;
  var installed = false;
  var menuItem = null;
  var originalRedraw = null;
  var cachedContext = null;
  var cachedPattern = null;
  var poll = null;
  var attempts = 0;

  function getStripePattern(context) {
    if (context === cachedContext && cachedPattern) return cachedPattern;

    // Exactly two INTEGER backing pixels high; no scaling or CSS interpolation.
    var tile = document.createElement("canvas");
    tile.width = 1;
    tile.height = 2;
    var tileContext = tile.getContext("2d");
    var pixels = tileContext.createImageData(1, 2);
    pixels.data[0] = 0;
    pixels.data[1] = 0;
    pixels.data[2] = 0;
    pixels.data[3] = 107;  // 42% black, one pixel.
    // Second row remains fully transparent.
    tileContext.putImageData(pixels, 0, 0);

    cachedContext = context;
    cachedPattern = context.createPattern(tile, "repeat");
    return cachedPattern;
  }

  function applyScanlines(instance) {
    if (!enabled || instance.type === "compact") return;
    var context = instance.context;
    var canvas = instance.canvas;
    if (!context || !canvas || !canvas.width || !canvas.height) return;

    var pattern = getStripePattern(context);
    if (!pattern) return;

    context.save();
    // Same pixel grid and same bitmap as James' C64 output; no separate
    // DOM layer that could shift during zoom, resize or browser compositing.
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = pattern;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }

  function toggle() {
    enabled = !enabled;
    if (menuItem) menuItem.setChecked(enabled);
    // Clear lines immediately upon OFF even while debugger is paused.
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
      var node = document.getElementById(menus[i].menuBarItemId);
      if (menus[i].label === "C64" && node &&
          node.classList.contains("ui-menu-c64")) {
        c64Menu = menus[i];
        break;
      }
    }
    if (!c64Menu) return false;

    originalRedraw = C64Debugger.prototype.redraw;
    C64Debugger.prototype.redraw = function () {
      var result = originalRedraw.apply(this, arguments);
      applyScanlines(this);
      return result;
    };
    menuItem = c64Menu.addItem({
      label: "CRT Scanlines (CRT06)",
      id: "ricos-crt06-scanlines",
      checked: false
    });
    menuItem.on("click", toggle);
    installed = true;
    console.info("[RicOS CRT06] One-pixel native scanlines ready (OFF).");
    return true;
  }

  function tryInstall() {
    if (install() || ++attempts >= 150) clearInterval(poll);
  }

  poll = setInterval(tryInstall, 100);
  tryInstall();
})();
