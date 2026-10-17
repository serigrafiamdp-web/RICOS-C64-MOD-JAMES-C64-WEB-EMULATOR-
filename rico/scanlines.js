/* RicOS TEST CRT09: MAME-style CLEAN scanlines via one WebGL shader pass.
   1 ON / 1 OFF output pixel, uniform darkness 30%, variation 0, blur 0,
   no curvature, no mask. A SINGLE full-screen triangle prevents any seam.
   No DOM overlay, no gradients and no changes to James' source / WASM. */
(function () {
  "use strict";

  var enabled = false;
  var installed = false;
  var menuItem = null;
  var originalRedraw = null;
  var timer = null;
  var attempts = 0;
  var filter = null;
  var webglFailed = false;

  function createFilter() {
    var buffer = document.createElement("canvas");
    var gl = buffer.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      premultipliedAlpha: true
    }) || buffer.getContext("experimental-webgl", {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: true
    });
    if (!gl) return null;

    var vertexSource = [
      "attribute vec2 position;",
      "void main() {",
      "  gl_Position = vec4(position, 0.0, 1.0);",
      "}"
    ].join("\n");

    var fragmentSource = [
      "precision highp float;",
      "void main() {",
      "  float row = floor(gl_FragCoord.y);",
      "  float stripe = 1.0 - mod(row, 2.0);",
      "  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.38 * stripe);",
      "}"
    ].join("\n");

    function shader(type, source) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("[RicOS CRT09] Shader compile error:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }

    var vert = shader(gl.VERTEX_SHADER, vertexSource);
    var frag = shader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vert || !frag) return null;

    var program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[RicOS CRT09] Shader linking failed:", gl.getProgramInfoLog(program));
      return null;
    }
    gl.deleteShader(vert);
    gl.deleteShader(frag);

    gl.useProgram(program);
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // One oversized triangle. Unlike a quad made of two triangles, it
    // cannot produce a seam on the display diagonal.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       3, -1,
      -1,  3
    ]), gl.STATIC_DRAW);
    var attribute = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);

    gl.disable(gl.BLEND);
    gl.disable(gl.DITHER);
    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.DEPTH_TEST);

    return { buffer: buffer, gl: gl, width: 0, height: 0 };
  }

  function fallbackDraw(context, canvas) {
    // Pixel-exact Canvas2D fallback if WebGL is not supported.
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = "rgba(0,0,0,0.38)";
    for (var row = 0; row < canvas.height; row += 2) {
      context.fillRect(0, row, canvas.width, 1);
    }
    context.restore();
  }

  function drawScanlines(instance) {
    if (!enabled || instance.type === "compact") return;
    var canvas = instance.canvas;
    var context = instance.context;
    if (!canvas || !context || !canvas.width || !canvas.height) return;

    if (!filter && !webglFailed) {
      try {
        filter = createFilter();
      } catch (error) {
        console.warn("[RicOS CRT09] WebGL unavailable:", error);
      }
      if (!filter) webglFailed = true;
    }

    if (!filter || filter.gl.isContextLost()) {
      fallbackDraw(context, canvas);
      return;
    }

    var w = canvas.width;
    var h = canvas.height;
    if (filter.width !== w || filter.height !== h) {
      filter.width = w;
      filter.height = h;
      filter.buffer.width = w;
      filter.buffer.height = h;
      filter.gl.viewport(0, 0, w, h);
    }

    // The shader draws only horizontal alpha stripes; no video texture.
    // Composite onto the SAME original canvas, after James' normal redraw.
    filter.gl.drawArrays(filter.gl.TRIANGLES, 0, 3);
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.drawImage(filter.buffer, 0, 0);
    context.restore();
  }

  function toggle() {
    enabled = !enabled;
    if (menuItem) menuItem.setChecked(enabled);
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
    var realMenu = null;
    for (var i = 0; i < menus.length; i++) {
      var node = document.getElementById(menus[i].menuBarItemId);
      if (menus[i].label === "C64" && node &&
          node.classList.contains("ui-menu-c64")) {
        realMenu = menus[i];
        break;
      }
    }
    if (!realMenu) return false;

    originalRedraw = C64Debugger.prototype.redraw;
    C64Debugger.prototype.redraw = function () {
      var result = originalRedraw.apply(this, arguments);
      drawScanlines(this);
      return result;
    };
    menuItem = realMenu.addItem({
      label: "CRT Scanlines (CRT09)",
      id: "ricos-crt08-scanlines",
      checked: false
    });
    menuItem.on("click", toggle);
    installed = true;
    console.info("[RicOS CRT09] CLEAN shader ready, default OFF.");
    return true;
  }

  function start() {
    if (install() || ++attempts >= 150) clearInterval(timer);
  }
  timer = setInterval(start, 100);
  start();
})();
