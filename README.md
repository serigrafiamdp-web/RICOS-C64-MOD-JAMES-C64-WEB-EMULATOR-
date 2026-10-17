# RicOS C64 MOD — James C64 Web Emulator

> **MASTER HORA CERO — PASS (17/10/2026):** versión 1:1 de James aprobada por el usuario, congelada en la rama [`MASTER_HORA_CERO`](../../tree/MASTER_HORA_CERO). Referencia exacta y política anti-regresiones en [docs/MASTER_HORA_CERO.md](docs/MASTER_HORA_CERO.md).\n\n## TEST 03 — ORIGINAL JAMES 1:1 (nueva base)

**Estado:** copia íntegra de la distribución original 2023, 555 archivos cotejados byte por byte mediante GitHub Actions. Prueba visual/funcional en navegador pendiente.

La nueva base está enlazada mediante el submódulo `vendor/lvllvl`, que referencia directamente el commit `b528e4c1d38faeadb0e24eb619705e4f0b8ab899` del [repositorio original de James](https://github.com/jaammees/lvllvl). **No se eliminó nada del código original.** El build copia `dist/` íntegramente, sin alterar HTML, JS ni CSS de `/c64/`, y sólo agrega una redirección de entrada del dominio del proyecto a esa carpeta. El HTML original del editor de la raíz se preserva como `original-lvllvl-index.html` en el paquete.

- **[Documentación completa y criterios TEST 03](docs/TEST_03_ORIGINAL.md)**
- **[GitHub Actions: TEST 03 - Original James C64 1to1](../../actions/workflows/james-original-pages.yml)** (bajá el artefacto `RicOS-TEST03-JAMES-ORIGINAL-1TO1` después de una ejecución exitosa)
- **[Auditoría y lista original de menús](docs/AUDITORIA_ORIGINAL_C64_1A1.md)**
- **Publicación:** activar GitHub Pages con Source = **GitHub Actions**, no Deploy from a branch.

> El GitHub Pages anterior muestra TEST 02 mientras la configuración Pages siga en «Deploy from a branch». Tras pasar a «GitHub Actions» y finalizar el workflow, la página debería mostrar la interfaz original. No se declara PASS visual hasta probarla.

**Precaución de licencia:** el repositorio de James no expone una licencia general evidente; aclarar su permiso de redistribución/publicación antes de compartir públicamente la copia del sitio. El acceso público al source no equivale a una licencia de redistribución.

---

## HISTÓRICO — TEST 02 (FAIL como clon original)

## TEST 02 — interfaz tipo debugger (FAIL)

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
