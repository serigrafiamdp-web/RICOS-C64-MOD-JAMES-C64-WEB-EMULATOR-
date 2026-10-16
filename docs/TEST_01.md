# RicOS C64 — TEST 01

**Estado: NO PASS · necesita validación en navegador.**

## Criterios PASS / FAIL
- [ ] Abre por HTTP y habilita controles cuando carga WebAssembly.
- [ ] Start/clic en canvas muestra BASIC C64.
- [ ] Teclado y audio funcionan después de iniciar.
- [ ] Reset, Pause/Resume y Fullscreen funcionan.
- [ ] PRG BASIC de prueba arranca.
- [ ] D64 de prueba arranca; multi-file se comprueba aparte.
- [ ] No aparecen herramientas del editor PETSCII.
- [ ] Recarga y nueva ejecución sin errores de consola.

## Alcance
Primera extracción: emulador C64 del exportador web de James, con shell propio. El debugger completo de `lvllvl.com/c64/` se portará solamente después del PASS de arranque.

Probar localmente mediante `python -m http.server 8080` y navegar a `http://localhost:8080/`. No publicar sin verificar licencias de los binarios originales.
