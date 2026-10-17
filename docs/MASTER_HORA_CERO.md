# MASTER HORA CERO — BASE APROBADA (PASS)

**Estado:** PASS confirmado por el usuario el 17 de octubre de 2026.

**Propósito:** punto de restauración permanente anterior a cualquier modificación propia de RicOS al clon original del emulador C64 de James. **No modificar ni avanzar la rama `MASTER_HORA_CERO`.**

## Identidad exacta del checkpoint

- **Repositorio RicOS:** `serigrafiamdp-web/RICOS-C64-MOD-JAMES-C64-WEB-EMULATOR-`
- **Rama congelada:** `MASTER_HORA_CERO`
- **Commit RicOS verificado y aprobado:** `486ac86a1d934e11268da69a2f7fae3305f4b0c1`
- **Origen exacto del código de James:** `jaammees/lvllvl`, commit `b528e4c1d38faeadb0e24eb619705e4f0b8ab899`.
- **Mecanismo de origen:** submódulo Git `vendor/lvllvl`, fijado a ese SHA; el fuente y la distribución completa permanecen en el repositorio original. Para un clon local se debe usar `git clone --recurse-submodules`.
- **Distribución generada:** 555 archivos originales de `dist/`, verificados byte por byte mediante `scripts/build-original.sh`.
- **Entrada C64 original:** `dist/c64/index.html`, intacta (publicada como `c64/index.html`).
- **Únicas incorporaciones de publicación:** redirección desde raíz a `./c64/`, y `.nojekyll`. El `dist/index.html` original se conserva como `original-lvllvl-index.html`.
- **GitHub Actions PASS:** ejecución `39003997213`, commit `486ac86a1d934e11268da69a2f7fae3305f4b0c1`, con `verify-original` y `deploy` terminados exitosamente.
- **PASS visual/funcional:** confirmado por el usuario al abrir la GitHub Page con la interfaz auténtica original de James.
- **GitHub Page:** `https://serigrafiamdp-web.github.io/RICOS-C64-MOD-JAMES-C64-WEB-EMULATOR-/c64/`

## Política anti-regresiones

1. **MASTER HORA CERO es intocable.** Nunca hacer commits ni actualizar la referencia de esta rama.
2. Todo cambio nuevo se hace en una rama separada desde esta base.
3. Modificar una sola función o conjunto mínimo por TEST y validar PASS/FAIL antes de integrar.
4. Los ocho menús originales y todos los submenús, opciones, ventanas, recursos y funcionalidades se conservan por defecto. No borrar nada «porque parece sobrar».
5. Los cambios en un TEST que den FAIL se descartan o corrigen sin mover el MASTER.
6. Si una futura versión falla, restaurar desde `MASTER_HORA_CERO`, commit `486ac86a1d934e11268da69a2f7fae3305f4b0c1`.

## Enlaces

- [Rama MASTER HORA CERO](https://github.com/serigrafiamdp-web/RICOS-C64-MOD-JAMES-C64-WEB-EMULATOR-/tree/MASTER_HORA_CERO)
- [Commit exacto aprobado](https://github.com/serigrafiamdp-web/RICOS-C64-MOD-JAMES-C64-WEB-EMULATOR-/commit/486ac86a1d934e11268da69a2f7fae3305f4b0c1)
- [Ejecución de publicación PASS](https://github.com/serigrafiamdp-web/RICOS-C64-MOD-JAMES-C64-WEB-EMULATOR-/actions/runs/39003997213)
- [TEST 03 original](TEST_03_ORIGINAL.md)
- [Auditoría original](AUDITORIA_ORIGINAL_C64_1A1.md)

## Nota de integridad y derechos

La rama RicOS conserva **una referencia fijada** al repositorio upstream, no una copia autónoma de los 555 archivos. El build exacto está reproducible mientras el commit upstream siga disponible. La publicación/distribución de recursos de James requiere aclarar sus condiciones de licencia; no se encontró una licencia general evidente en su repositorio.
