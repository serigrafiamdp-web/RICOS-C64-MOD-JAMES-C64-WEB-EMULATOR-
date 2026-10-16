# RicOS C64 MOD — James C64 Web Emulator

**Estado:** TEST 01 preparado para pruebas manuales (NO PASS todavía).  
**Repositorio:** privado; prototipo de investigación y adaptación.

## Propósito

Separar un reproductor/emulador C64 de la aplicación LVLLVL (editor PETSCII). Mantener el núcleo WebAssembly y las funciones esenciales para cargar programas locales, sin interfaz ni dependencias del editor PETSCII.

**Origen técnico:** https://github.com/jaammees/lvllvl (James / jaammees)

## TEST 01 — Arranque independiente

- HTML, CSS e interfaz propios, sin el editor PETSCII.
- Runtime autónomo del exportador C64 de James: `js/c64.min.js` + `js/c64.wasm` y recursos visuales requeridos.
- Arranque de C64 al hacer clic en la pantalla o pulsar **Start**.
- Reset; pausa/reanudar; pantalla completa.
- Carga local de archivos PRG, D64 o CRT desde el navegador (sin enviar archivos a un servidor).
- Pruebas manuales pendientes, ver `docs/TEST_01.md`.

**Limitación de alcance:** esta primera fase NO incluye el debugger con paneles de memoria/registro/disassembly presente en `lvllvl.com/c64/`. Extraerlo requiere aislar más componentes de `src/js/debugger` y sus dependencias, sin arrastrar los módulos PETSCII.

## Para probar localmente

Servir la carpeta con un servidor HTTP estático (no abrir `index.html` mediante `file://`, porque WebAssembly se carga por fetch). Por ejemplo, desde la carpeta del repositorio:

```sh
python -m http.server 8080
```

Visitar `http://localhost:8080/`, hacer clic en la pantalla C64 y comprobar el arranque.

**No activar GitHub Pages ni hacer público el repositorio por ahora.** No se ha identificado una licencia general clara que autorice redistribuir los archivos provenientes de `jaammees/lvllvl`; verificar permisos/licencias antes de publicar o compartir.

## Estructura

- `index.html`: interfaz RicOS independiente.
- `app.js`: controles y carga de archivos locales (código nuevo de esta adaptación).
- `js/content.js`: configuración inicial propia.
- `js/c64.min.js` y `js/c64.wasm`: componentes del emulador original.
- `images/`: recursos gráficos de la interfaz móvil original.
- `docs/TEST_01.md`: protocolo de pruebas PASS/FAIL.

**Nota:** no sustituye ni modifica ninguna rama de `jaammees/lvllvl`.
