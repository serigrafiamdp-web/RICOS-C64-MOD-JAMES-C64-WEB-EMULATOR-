# Auditoría de referencia 1:1 — James / LVLLVL C64

**Estado:** AUDITORÍA DE FUENTES COMPLETADA · CLON EXACTO NO IMPLEMENTADO · TEST 02 = FAIL COMO CLON 1:1.

**Objetivo acordado:** obtener en RicOS exactamente el aspecto, menús, submenús, orden, disposición inicial, controles y funcionalidades de `https://www.lvllvl.com/c64/`. Solo después de un PASS de paridad con el original, independizarlo del editor PETSCII y hacer modificaciones controladas.

**Referencia visual:** captura de la página original aportada por el usuario (barra superior negra con C64, Sound, Joystick, Size, Speed, View, Assembler, Share; pantalla BASIC centrada sobre negro; indicadores DRIVE/joystick debajo; registro CPU y paneles laterales no visibles inicialmente).

**Fuente GitHub:** https://github.com/jaammees/lvllvl  
**Commit examinado:** `b528e4c1d38faeadb0e24eb619705e4f0b8ab899` (2023-11-26).  
**Versión del build examinado:** `0.495` en `build.php`.  
**Limitación de evidencia:** no fue posible inspeccionar los desplegables con una sesión de navegador interactiva directamente sobre la web en vivo; los ítems se extrajeron de `src/js/editor.js`. Confirmar que la web de producción no difiera del commit archivado mediante pruebas y capturas.

## 1. Arquitectura real

`/c64/` **no** es `src/c64page/index.html`. La carpeta `c64page` es el exportador/reproductor sencillo de PRG/D64/CRT: carece de los menús completos del sitio. TEST 01 y TEST 02 se basaron erróneamente en ese reproductor y en una interfaz manual.

El emulador completo usa:

- `dist/c64/index.html` — entrada original de la ruta `/c64/`.
- `dist/css/style.css` — estilos del producto original.
- `dist/js/libs.js` — bibliotecas que usa la interfaz.
- `dist/js/html/htmlcache.js` — plantillas y paneles HTML.
- `dist/js/main.js` — aplicación y sistema de menús/ventanas, compilado desde `src/js/*`, incluyendo el modo emulador.
- `dist/js/storageManager.js`, `dist/js/githubClient.js` — módulos de almacenamiento/servicios.
- `dist/js/acmeAssembler.js`, `dist/js/ca65Assembler.js` — ensambladores.
- `dist/c64/c64/c64.js`, `dist/c64/c64/c64.wasm` — núcleo WebAssembly y loader.
- `dist/js/c64/c64.js` — interfaz Javascript del núcleo.
- `dist/icons`, `dist/images`, `dist/fonts`, `dist/css`, `dist/html` empaquetado, otros recursos de `dist`.

El HTML original contiene `<base href="../">`: si la distribución `dist` está alojada en la raíz de GitHub Pages, la ruta `[repo]/c64/` resuelve correctamente sus scripts hacia la raíz del proyecto. `dist/index.html` corresponde al editor, **no debe convertirse en la página de inicio RicOS**. Para iniciar directamente el C64 desde la raíz, usar una redirección relativa de la raíz a `./c64/`, manteniendo `c64/index.html` original.

En `src/js/file/startPage.js` está comprobado:
```js
if (url.indexOf('/c64/') !== -1) {
  editor = 'c64';
}
```
En `src/js/editor.js`, el modo `c64` muestra `c64debuggerPanel` y el menú marcado `ui-menu-c64` mediante `C64Debugger.show()`.

## 2. Inventario de menús originales (desde src/js/editor.js)

**C64** (12 opciones): Show Raster Position; Show Grid; Mouse Info; Load PRG...; Attach D64...; Autostart D64...; Insert CRT...; Download Snapshot; sección «PRG Start Settings» con Load/Run, Inject into RAM, Random Delay; Reset Machine. Opciones de modelos PAL/NTSC y «Settings...» comentadas en el código: **NO agregar**.

**Sound** (3): Sound Playback; sección «SID Model» con 6581 y 8580.

**Joystick** (6): Port 1, Port 2, Swap Joysticks, Joystick Settings...; sección «1351 Mouse» con Port 1 y Port 2.

**Size** (6): 100%, 200%, 300%, 400%, Fit Pixel Multiple, Fit.

**Speed** (6): 25%, 50%, 100%, 150%, 200%, 300%.

**View** (16): Disassembly; Scripting; BASIC; Colours; Memory; Character Set; Sprites; Bitmap; SID; Drive; Docs; Calculator; Increase Font Size; Decrease Font Size; Reset Font Size; Perf Stats.

**Assembler** (6): Show Assembler; Show Invisible Characters; Autocomplete; Use Tab indentation; sección «Theme» con Light y Dark.

**Share** (2): Create a Link to the Current PRG/D64/CRT...; Export PRG/D64/CRT as a HTML Page... . Una tercera opción «Download HTML Page» está comentada en el código: **NO agregar**.

**Total:** 8 menús, **57 ítems activos**; los títulos de sección (PRG Start Settings, SID Model, 1351 Mouse, Theme) son separadores/etiquetas, no menús anidados implementados libremente.

**Cabecera a la derecha:** se ven botones de autenticación GitHub y Share; son independientes del menú «Share». Se crean en `src/js/editor.js` y están vinculados a autenticación/compartir proyectos.

## 3. Disposición original al iniciar

`src/js/c64/c64Debugger.js` utiliza `C64Debugger.buildInterface()` y la arquitectura de componentes `UI.SplitPanel`/`UI.TabPanel` original. En escritorio establece inicialmente:
```js
var showDebuggerPanels = false;
if (isMobile) showDebuggerPanels = true;
```
Los paneles laterales de CPU/memoria se crean, pero permanecen colapsados en la primera vista de escritorio. La captura aportada muestra, efectivamente, la pantalla C64 grande centrada sobre fondo negro, barra de menús fina arriba e indicadores DRIVE y joystick abajo.

**No** abrir Memory, SID, CPU, Registers ni inventar paneles permanentes al inicio. Esas vistas deben abrir/cerrar y distribuir espacio igual que el original mediante los menús y controles originales.

## 4. Diferencias y razones del FAIL de RicOS TEST 02

- `index.html` se diseñó manualmente: **no es** `dist/c64/index.html`.
- `rico-clone-v2.css` y `rico-clone-v2.js` son recreaciones que **no existen** en el original.
- TEST 02 **omite** View, Assembler y Share, varias opciones de C64 y las ventanas de configuración.
- TEST 02 pone CPU/Memory permanentemente abiertos, contrariando el estado inicial de James.
- Las pestañas de diagnósticos de RicOS sustituyen visores originales de Charset, Sprites, Bitmap, SID, Drive, Scripting, BASIC y otros.
- Se usa `js/c64.min.js` de `c64page`; falta la infraestructura de UI real: `dist/js/main.js`, `libs.js`, `htmlcache.js`, menú nativo y debugger original.
- Una prueba de sintaxis y presencia de archivos **no demuestra** paridad visual ni funcional.

**No continuar parches sobre TEST 02 para alcanzar paridad; restaurar la distribución original primero.**

## 5. Ruta recomendada en GitHub (sin inventar componentes)

1. Mantener `backup/test-01-player`; crear una nueva rama de preparación para la distribución original, sin modificar el master hasta verificar.
2. Reproducir la distribución original `dist` **sin cambiar** HTML/CSS/JS de James. Contiene 555 archivos (~17,6 MB). Evitar copiar solo `dist/c64`: sus scripts usan `../`.
3. Colocar `dist` como árbol estático de publicación del repo, con `c64/index.html` intacto y `index.html` de raíz como redirección relativa hacia `./c64/`.
4. Confirmar carga de los 8 menús y los 57 ítems; captura inicial idéntica a la referencia; atajos, menús, diálogos, tamaños, sonido, teclado, joystick, PRG/D64/CRT, snapshots, ensamblador, visores y debugger.
5. Solo después de PASS, identificar y quitar código PETSCII **sin alterar la interfaz** y pasando la misma batería de pruebas tras cada extracción.
6. Antes de redistribuir públicamente el contenido completo, aclarar licencias/permisos: no aparece un archivo LICENSE general en la raíz del repositorio fuente.

## 6. Limitaciones/controles externos

- La compilación original incluye scripts externos Firebase y Google API: el login con GitHub, las cuentas y el sistema de compartir podrían depender del dominio/autorización del servidor original, y **no está comprobado** que funcionen en GitHub Pages.
- El núcleo C64 está en WebAssembly compilado; no se encontró el fuente original C/C++ del núcleo en este repositorio.
- `<link rel="manifest" href="/manifest.json">` es absoluto a la raíz de dominio. GitHub Pages de proyecto lo alojaría bajo el prefijo del repositorio: se debe evaluar sin cambiar la UI.
- El repositorio publicado en GitHub (commit 2023) puede no corresponder byte por byte a la instancia de producción actual: la paridad final debe contrastarse visualmente en ambos sitios.

## 7. Fuentes exactas

- https://github.com/jaammees/lvllvl/blob/b528e4c1d38faeadb0e24eb619705e4f0b8ab899/dist/c64/index.html
- https://github.com/jaammees/lvllvl/blob/b528e4c1d38faeadb0e24eb619705e4f0b8ab899/src/js/editor.js
- https://github.com/jaammees/lvllvl/blob/b528e4c1d38faeadb0e24eb619705e4f0b8ab899/src/js/c64/c64Debugger.js
- https://github.com/jaammees/lvllvl/blob/b528e4c1d38faeadb0e24eb619705e4f0b8ab899/src/js/file/startPage.js
- https://github.com/jaammees/lvllvl/blob/b528e4c1d38faeadb0e24eb619705e4f0b8ab899/build.php

**Regla del proyecto:** PASS/FAIL por comportamiento y paridad con la página original. Nada inventado; sin regresiones; testar contra la referencia antes de renombrar o añadir controles.
