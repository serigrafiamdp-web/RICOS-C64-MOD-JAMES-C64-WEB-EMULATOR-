/*
 * RicOS / James C64 — TEST CRT01: optional horizontal scanlines.
 * No changes to the C64 WebAssembly runtime, original menus or original renderer.
 * Default OFF. Menu item is added using the original UI.Menu API.
 */
(function () {
  "use strict";

  var installed = false;
  var timer = null;
  var attempts = 0;
  var maxAttempts = 120; // 12 seconds, then leave original behavior unchanged.
  var scanlinesEnabled = false;
  var originalRedraw = null;
  var item = null;

  function addScanlinesToCanvas(debuggerInstance) {
    if (!scanlinesEnabled || debuggerInstance.type === "compact") return;

    var canvas = debuggerInstance.canvas;
    var ctx = debuggerInstance.context;
    if (!canvas || !ctx || !canvas.width || !canvas.height) return;

    // 272 PAL/NTSC raster buffer pixels high, as in James' offscreen buffer.
    // Draw only on the DISPLAY canvas, after the original redraw is complete.
    // 0.36 emulator-pixel line height, across alternating source rows.
    // Native single-path rendering keeps overhead small.
    var rowScale = canvas.height / 272;
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
    ctx.beginPath();
    for (var y = 1; y < 272; y += 2) {
      var y0 = Math.round(y * rowScale);
      var y1 = Math.round((y + 0.36) * rowScale);
      ctx.rect(0, y0, canvas.width, Math.max(1, y1 - y0));
    }
    ctx.fill();
    ctx.restore();
  }

  function toggle() {
    scanlinesEnabled = !scanlinesEnabled;
    if (item && typeof item.setChecked === "function") {
      item.setChecked(scanlinesEnabled);
    }
    // A single redraw also works when the machine is paused.
    if (window.g_app && g_app.c64Debugger &&
        typeof g_app.c64Debugger.redraw === "function") {
      g_app.c64Debugger.redraw();
    }
  }

  function install() {
    if (installed) return true;
    if (!window.g_app || !g_app.menuBar || !g_app.c64Debugger ||
        !window.C64Debugger || !C64Debugger.prototype ||
        typeof C64Debugger.prototype.redraw !== "function") {
      return false;
    }

    var menus = g_app.menuBar.menus;
    if (!menus || !menus.length) return false;
    var c64Menu = null;
    for (var i = 0; i < menus.length; i++) {
      if (menus[i].label === "C64") {
        c64Menu = menus[i];
        break;
      }
    }
    if (!c64Menu) return false;

    // No hand-made dropdown or UI: this is the original James menu item type.
    originalRedraw = C64Debugger.prototype.redraw;
    C64Debugger.prototype.redraw = function () {
      var result = originalRedraw.apply(this, arguments);
      addScanlinesToCanvas(this);
      return result;
    };

    item = c64Menu.addItem({
      label: "CRT Scanlines",
      id: "ricos-c64-scanlines",
      checked: false
    });
    item.on("click", toggle);
    installed = true;
    console.info("[RicOS CRT01] Original C64 renderer preserved; CRT Scanlines option ready (OFF).");
    return true;
  }

  function attemptInstall() {
    if (install()) {
      clearInterval(timer);
    } else if (++attempts >= maxAttempts) {
      clearInterval(timer);
      console.warn("[RicOS CRT01] Original UI was not ready; scanline option not installed.");
    }
  }

  timer = setInterval(attemptInstall, 100);
  attemptInstall();
})();