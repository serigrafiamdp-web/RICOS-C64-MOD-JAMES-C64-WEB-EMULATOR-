# TEST CRT01 — Scanlines para emulador C64 original

**Estado inicial:** pendiente de pruebas en navegador; `MASTER_HORA_CERO` no se modifica.

## Objetivo visual
Scanlines horizontales finas y oscuras como la imagen de referencia proporcionada por el usuario. El efecto no debe tapar los píxeles, desenfocar caracteres ni modificar el contenido C64.

## Cambios mínimos
- Se conserva completo el source original de James `vendor/lvllvl` sin modificaciones.
- Tras verificar byte a byte los 555 archivos originales, el build publica el HTML original de `c64/index.html` con **una sola inclusión** adicional a `rico/scanlines.js`.
- El script agrega una opción nativa **C64 → CRT Scanlines**, desactivada por defecto, usando el sistema `UI.Menu` del propio James.
- El shader mínimo se superpone en `C64Debugger.prototype.redraw` **después** del render original, con bandas oscuras alternadas. No modifica WebAssembly, sonido, timing, memoria, framebuffer de origen, archivos PRG/D64/CRT ni la estructura de ventanas.
- Estado ON/OFF inmediato con marca de selección en el mismo menú original. OFF = dibujo sin cambios.

## Prueba PASS/FAIL
1. La GitHub Page conserva **los ocho menús completos** y pantalla idéntica al `MASTER_HORA_CERO` con scanlines OFF.
2. En menú **C64** aparece al final **CRT Scanlines**, sin otros menús nuevos.
3. ON: aparecen líneas horizontales oscuras con la apariencia de la imagen de referencia.
4. OFF: imagen idéntica al original, sin bandas.
5. ON/OFF también funciona si el emulador está pausado.
6. Verificar BASIC, PRG, D64, sonido SID, menú Size (100% / Fit), velocidad, joystick y debugger; sin regresiones ni errores de consola.
7. PASS o FAIL lo confirma el usuario después de abrir la página.

## Rollback
Rama congelada `MASTER_HORA_CERO`, commit `486ac86a1d934e11268da69a2f7fae3305f4b0c1`. Si falla el TEST, reconstruir desde ella; **nunca modificarla**.

El MASTER es completamente original; solo TEST CRT01 agrega scanlines.
