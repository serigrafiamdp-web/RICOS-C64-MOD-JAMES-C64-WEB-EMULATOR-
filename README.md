# RicOS C64 MOD — James C64 Web Emulator

**Proyecto de extracción de C64 standalone.** La interfaz objetivo es la de https://www.lvllvl.com/c64/ de James (`jaammees`), no la de un editor PETSCII ni el reproductor de exportación HTML.

## TEST 02 — interfaz tipo debugger

**Estado:** **FAIL COMO CLON 1:1**, confirmado al comparar el diseño y menús con la captura y la fuente de James. La verificación estática automatizada pasó, pero no valida fidelidad de interfaz.

**Página:** https://serigrafiamdp-web.github.io/RICOS-C64-MOD-JAMES-C64-WEB-EMULATOR-/

- Menús superiores recuperados: **C64 / Sound / Joystick / Size / Speed**.
- Ventana de C64 y debugger con CPU, registros, desensamblador y paneles de inspección.
- PRG / D64 / CRT, reset, pausa, CPU step, velocidad, snapshot y joystick.
- Página autónoma de la interfaz del editor PETSCII: no ejecuta `Editor()`, `js/main.js` ni `js/libs.js`.
- Base de emulación provista por `js/c64.min.js` + `js/c64.wasm` del reproductor original de James.

**Importante:** TEST 02 es una reconstrucción parcial de la interfaz original, **no una copia idéntica ni un debugger completo**. Varias pestañas son vistas de datos iniciales, no los visores gráficos elaborados de James. Se irá validando cada función individualmente.

**Referencia obligatoria:** [Auditoría original 1:1](docs/AUDITORIA_ORIGINAL_C64_1A1.md). No seguir añadiendo menús inventados; partir de la compilación original de James y validar antes de recortar PETSCII.\n\n## Código / documentación

- `index.html`, `rico-clone-v2.js`, `rico-clone-v2.css`: shell nueva.
- `js/c64.min.js`, `js/c64.wasm`: motor original.
- `docs/TEST_02.md`: pruebas PASS/FAIL y diferencias conocidas.
- Rama `backup/test-01-player`: resguardo del TEST 01 con reproductor simple.
- `.github/workflows/static-test.yml`: pruebas de sintaxis y estructura; **no reemplaza una prueba en navegador**.

## Créditos y permisos

Referencias: https://github.com/jaammees/lvllvl

Se ha verificado que dicho repositorio público no contiene una licencia general evidente en su raíz. La disponibilidad pública del código no implica permiso general de redistribución; aclarar los permisos con el autor antes de compartir o redistribuir materiales derivados. Este proyecto no está afiliado al sitio de James.
