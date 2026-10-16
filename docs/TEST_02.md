# RicOS C64 — TEST 02: reconstrucción de interfaz /c64/

**Estado: FAIL COMO CLON 1:1.** Los cinco menús reconstruidos y los paneles permanentes no reproducen la interfaz original, que tiene ocho menús completos y paneles inicialmente colapsados. Ver [Auditoría de fuente](AUDITORIA_ORIGINAL_C64_1A1.md).

## Objetivo

Mostrar al entrar a GitHub Pages una interfaz similar a `https://www.lvllvl.com/c64/`, con menús C64 / Sound / Joystick / Size / Speed, emulador C64 real y paneles de depuración, sin cargar el editor de PETSCII.

## Cambios

- Reemplazo del antiguo `index.html` simple.
- Menús con etiquetas documentadas del código original de James en `src/js/editor.js`.
- Ventana central de C64, panel CPU / Registers / Disassembly y panel Memory / Charset / Sprites / Bitmap / SID / Drive.
- Memoria y registros se leen del runtime C64 en vivo; el desensamblador inicial cubre instrucciones comunes y marca las restantes `.BYTE`.
- Carga PRG/D64/CRT, reset, ejecución/pausa/paso, joystick, SID, velocidad y snapshot desde menús.
- No se carga `js/main.js`, `js/libs.js` ni el `Editor()` PETSCII de LVLLVL.

## Diferencias conocidas frente a la página de James

Esta versión **NO es todavía un clon exacto**. La interfaz se reconstruyó sin incorporar el `C64Debugger` original ni las bibliotecas de UI de LVLLVL. El desensamblado cubre sólo un subconjunto de instrucciones, y las pestañas Charset, Sprites, Bitmap, SID y Drive comienzan con vistas de diagnóstico, no los visores gráficos completos de James. Las opciones de menú corresponden a los controles disponibles, pero no se puede garantizar la paridad funcional ni visual.

## Criterios de PASS

- [ ] La URL pública carga CSS y JS (sin 404) y dibuja los menús arriba.
- [ ] Arranca C64 BASIC haciendo clic en pantalla central y se habilita audio.
- [ ] Load PRG carga programa y ejecuta según modo Inject / Load-Run.
- [ ] Attach D64 y Autostart D64 funcionan con archivos simples.
- [ ] CPU Registers, Memory y Disassembly muestran datos reales que cambian.
- [ ] Play/Pause, Step, Reset y Speed funcionan.
- [ ] Joystick Port 1 / Port 2 funcionan.
- [ ] Sin errores JavaScript de ejecución.
- [ ] No se muestran herramientas del editor PETSCII.

## Versiones

- Copia estable anterior en rama `backup/test-01-player`.
- TEST 02 en rama `main`.
- Fuente consultada: `jaammees/lvllvl`, directorios `src/js/c64`, `src/js/debugger`, `dist/c64`.
- Antes de redistribuir recursos de James, verificar sus condiciones de licencia.

## Próximo paso

Probar en navegador real y corregir FAIL individuales. Luego igualar progresivamente los controles y visualizaciones restantes del debugger original.
