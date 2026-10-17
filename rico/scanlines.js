/* RicOS CRT03 — fine half-pitch scanlines at CSS display resolution.
   Original James C64 renderer, framebuffer and UI menu logic remain intact. */
(function () {
  "use strict";

  var VERSION = "CRT03";
  var installed = false, enabled = false, item = null;
  var overlay = null, canvas = null, holder = null;
  var checkTimer = null, layoutTimer = null, attempts = 0;

  function alignOverlay() {
    if (!enabled || !overlay || !canvas || !holder) return;
    var rect = canvas.getBoundingClientRect();
    var parentRect = holder.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    overlay.style.left = (rect.left - parentRect.left) + "px";
    overlay.style.top = (rect.top - parentRect.top) + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";

    // One horizontal scanline per emulator row, vs two rows in CRT01.
    // Draw using the browser's CSS gradient: fractional pixels are retained.
    var pitch = rect.height / 272;
    var thickness = Math.min(pitch * 0.46, pitch - 0.1);
    overlay.style.backgroundImage =
      "repeating-linear-gradient(to bottom," +
      "rgba(0,0,0,0.50) 0px," +
      "rgba(0,0,0,0.50) " + thickness.toFixed(3) + "px," +
      "transparent " + thickness.toFixed(3) + "px," +
      "transparent " + pitch.toFixed(3) + "px)";
  }

  function ensureOverlay() {
    if (!window.g_app || !g_app.c64Debugger) return false;
    canvas = g_app.c64Debugger.canvas || document.getElementById("c64DebuggerCanvas");
    if (!canvas) return false;
    holder = document.getElementById("c64DebuggerCanvasHolder") || canvas.parentElement;
    if (!holder) return false;

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "ricos-crt03-scanlines";
      overlay.setAttribute("aria-hidden", "true");
      overlay.style.cssText =
        "position:absolute;pointer-events:none;display:none;z-index:1;" +
        "background-repeat:repeat;will-change:transform";
      // Put effect immediately after picture but BELOW James' play / joystick controls.
      canvas.insertAdjacentElement("afterend", overlay);
    }
    return true;
  }

  function toggle() {
    enabled = !enabled;
    if (item) item.setChecked(enabled);
    if (enabled && ensureOverlay()) {
      overlay.style.display = "block";
      alignOverlay();
      layoutTimer = setInterval(alignOverlay, 300);
    } else {
      if (overlay) overlay.style.display = "none";
      if (layoutTimer) clearInterval(layoutTimer);
      layoutTimer = null;
    }
  }

  function install() {
    if (installed) return true;
    if (!window.g_app || !g_app.menuBar || !g_app.c64Debugger) return false;
    var menus = g_app.menuBar.menus;
    if (!menus || !menus.length) return false;

    var nativeC64Menu = null;
    for (var i = 0; i < menus.length; i++) {
      var el = document.getElementById(menus[i].menuBarItemId);
      if (menus[i].label === "C64" && el &&
          el.classList.contains("ui-menu-c64")) {
        nativeC64Menu = menus[i];
        break;
      }
    }
    if (!nativeC64Menu) return false;

    // Temporarily show test number to prove updated JS actually loaded.
    item = nativeC64Menu.addItem({
      label: "CRT Scanlines (CRT03)",
      id: "ricos-crt03-scanlines",
      checked: false
    });
    item.on("click", toggle);
    installed = true;
    console.info("[RicOS CRT03] Fine 1-row scanline overlay ready; native video untouched.");
    return true;
  }

  function init() {
    if (install()) {
      clearInterval(checkTimer);
    } else if (++attempts >= 150) {
      clearInterval(checkTimer);
      console.warn("[RicOS CRT03] Menu not ready; leaving original emulator unchanged");
    }
  }

  checkTimer = setInterval(init, 100);
  init();
})();
