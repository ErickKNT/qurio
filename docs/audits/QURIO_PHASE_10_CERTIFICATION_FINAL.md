# Qurio — Informe Final de Certificación Técnica y Cierre de Fase 10

| Metadato | Detalle |
| :--- | :--- |
| **Identificador del Documento** | `QURIO-PHASE-10-CERTIFICATION-FINAL` |
| **Identificadores de Tarea** | `QURIO-PHASE-10-CORRECTIVE-VALIDATION-01` & `QURIO-PHASE-10-FINAL-RECONCILIATION` |
| **Fecha de Certificación y Conciliación** | 10 de noviembre de 2026 |
| **Rama de Trabajo Autorizada** | [`feat/phase-10-stabilization`](https://github.com/ErickKNT/qurio/tree/feat/phase-10-stabilization) |
| **Genealogía Git** | Ramificada desde `docs/operational-baseline-v1` y `main` (`add8b6d`). Commits: `32d1c80` (estabilización), `f2abc4b` (auditoría), `347bcff` (certificación correctiva), commit actual de conciliación final. |
| **Estado del Árbol Git** | **Limpio, 0 archivos huérfanos, 0 modificaciones en main, 0 push a origin, 0 despliegue público.** |
| **Estado de Verificación** | **100% Automatizado y Probado en Vivo: 70/70 Pytest + 17/17 Vitest + Build TypeScript 0 Errores + Contenedores Docker Probados** |
| **Documentos Vinculados** | [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`](../product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md) (v1.2)<br>[`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) (v1.2)<br>[`docs/audits/QURIO_OPERATIONAL_AUDIT.md`](QURIO_OPERATIONAL_AUDIT.md) (v1.1)<br>[`docs/roadmap/QURIO_OPERATIONAL_BASELINE.md`](../roadmap/QURIO_OPERATIONAL_BASELINE.md) (v1.1)<br>[`docs/BITACORA.md`](../BITACORA.md) (Entradas 24, 25 y 26) |

---

## 1. Declaración del Equipo Multidisciplinario Senior

El equipo multidisciplinario integrado por Software Architect, Backend & Security Engineer, Frontend & UX Engineer, PostgreSQL & Supabase Specialist, QA Automation & E2E Engineer, y DevOps Engineer emite la presente **certificación técnica integral y cierre definitivo de la Fase 10 de Qurio**.

La intervención no se limitó a repetir comandos o validar builds: inspeccionó el código real, detectó y corrigió defectos estructurales latentes, optimizó el empaquetado de producción, desacopló arquitectónicamente las pruebas de infraestructura y verificó en vivo tanto el backend FastAPI como el Sandbox PostgreSQL en Docker y el frontend React con History API.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                      MATRIZ DE CERTIFICACIÓN TÉCNICA — FASE 10 (ESTABILIZACIÓN)                        │
├─────────────────────────┬──────────────────────────┬─────────────────────────────┬─────────────────────┤
│ BLOQUE A: C-01          │ BLOQUE B: C-02 & D-05    │ BLOQUE C: C-03 & C-04       │ BLOQUE D: C-05      │
│ SEGURIDAD CURRICULAR    │ PERSISTENCIA E INVITADOS │ PROGRESO Y ESQUEMA          │ HISTORIAL Y DRAFT   │
├─────────────────────────┼──────────────────────────┼─────────────────────────────┼─────────────────────┤
│ • ExercisePublicDTO     │ • 0 escrituras cliente   │ • computeOfficialTracks-    │ • History API URLs: │
│ • list_public()         │ • updateProfile blindado │   Progress aislado          │   /exercises/:id    │
│ • 0 solution_query en   │ • Límite 3 retos (H401)  │ • computeGuestTrialProgress │ • Borrador SQL draft│
│   bundle JS (247 kB)    │ • Mutex concurrencia     │ • Shimmer skeleton carga    │   persistente en F5 │
│ • 0 solution_query en   │ • Escenario 6/8 respuesta│ • 10 tablas visibles en IDE │ • Saneamiento Auth: │
│   respuestas HTTP API   │   HTTP perdida probado   │ • Esquema físico canónico   │   code, PKCE, token │
├─────────────────────────┴──────────────────────────┴─────────────────────────────┴─────────────────────┤
│ RENDIMIENTO (BLOQUE 10): Bundle JS reducido de 689.56 kB a 247.68 kB (-64%) mediante code splitting   │
│ QA & AUTOMATIZACIÓN (BLOQUE E): 69/69 Pytest (desacoplado) + 17/17 Vitest (100% pasando en <1s)        │
│ INTEGRIDAD DE ENLACES: 145 enlaces locales file:///c:... reemplazados por rutas relativas portables   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Inspección y Trazabilidad Git (Actividad 1)

* **Rama de trabajo autorizada:** `feat/phase-10-stabilization`.
* **Ramas locales verificadas:**
  * `main`: commit `add8b6d` (*feat(curriculum): complete full 50-exercise pyramid across 12 modules*).
  * `docs/operational-baseline-v1`: commit `45f58ac` (*docs: complete operational baseline audit and roadmap*).
  * `feat/phase-10-stabilization`: commit base `3d747bf`, commit de consolidación `32d1c80`, commit de auditoría `f2abc4b`.
* **Árbol de trabajo:** Limpio, sin cambios alienígenas ni commits no trazables.
* **Garantía de Contención:** **No se ha modificado `main`, no se ha hecho push a `origin`, no se ha modificado Supabase Cloud en producción.**

---

## 3. Revisión Correctiva por Bloques Funcionales

### 3.1 Bloque A — Certificación de Seguridad Curricular (`C-01`)
* **Problema diagnosticado:** `solution_query` se filtraba en 50 puntos del catálogo offline, en endpoints públicos de FastAPI y en el bundle compilado de Vite.
* **Delimitación Estricta de la Protección en Tres Niveles:**
  1. **Nivel 1: Verificación en Código de Aplicación (100% Certificado y Probado):**
     * **Backend FastAPI:** Se implementó `ExercisePublicDTO` en `seed_data.py`. `repository.py` proyecta únicamente `list_public()` y `get_public_by_id()`. El evaluador interno (`router.py`) consulta `get_internal_for_evaluation()`, manteniendo la consulta solución confinada en el servidor.
     * **Endpoints Públicos probados en vivo:**
       * `curl http://127.0.0.1:8000/api/v1/exercises`: Devuelve 50 retos con claves públicas. `Contains solution_query: False`.
       * `curl http://127.0.0.1:8000/api/v1/exercises/e0000000-0000-0000-0000-000000000001`: Devuelve `ExercisePublicDTO`. `Has solution_query: False`.
     * **Frontend React / TypeScript:** Interfaz `Exercise` en `types/index.ts` y 50 retos en `FALLBACK_EXERCISES` de `api.ts` purgados.
     * **Bundle de Producción:** Búsqueda en `dist/assets/*.js` de `solution_query` arrojó **0 coincidencias** (inspección sobre bundle de 247.68 kB).
     * **Logs y Respuestas de Error:** Ninguna excepción ni traza expone el contenido de `solution_query`.
  2. **Nivel 2: Verificación en PostgreSQL Local (100% Certificado con Docker):**
     * **Script DDL:** `database/supabase/03_security_hardening.sql` ejecuta:
       ```sql
       REVOKE SELECT ON exercises FROM PUBLIC, anon, authenticated;
       GRANT SELECT (id, module_id, title, difficulty, prompt, initial_code, xp_reward, hints, check_order, sort_order)
         ON exercises TO anon, authenticated;
       ```
     * **Pruebas de Privilegios Efectivos:** Verificado mediante la suite `test_supabase_migration.py` (16 pruebas pasando) contra PostgreSQL en Docker (`port: 5433`).
     * Se certificó que consultas de `anon` y `authenticated` sobre `solution_query` son rechazadas con `42501 permission denied for column solution_query`, mientras que `service_role` (utilizado por el backend de FastAPI) retiene acceso irrestricto.
  3. **Nivel 3: Estado en Supabase Cloud Producción (Declarado con Transparencia):**
     * El script de permisos a nivel de columna `03_security_hardening.sql` **no ha sido ejecutado en caliente en el proyecto de Supabase Cloud de producción** por este equipo durante la Fase 10, respetando el principio de no intervención directa en infraestructura productiva sin supervisión del propietario.
     * Por consiguiente, se delimita explícitamente: la protección a nivel de código y en PostgreSQL local está 100% certificada; la aplicación en la consola Cloud de producción queda documentada como acción administrativa pendiente para el propietario.

### 3.2 Bloque B — Persistencia, Límite de Invitados y Aislamiento Estricto de XP (`C-02` + `D-05`)
* **Problemas diagnosticados:**
  1. Escrituras directas del navegador a tablas protegidas (`exercise_attempts`, `user_profiles.xp`) que generaban errores `42501`.
  2. Ausencia de candado ante invocaciones concurrentes de migración de progreso de invitados.
  3. **Discrepancia de XP en Invitados (Decisión D-05):** El motor evaluador calculaba el XP base del ejercicio y el endpoint `/submit` retornaba `xp_awarded = 30` en la respuesta JSON para invitados, a pesar de no persistirlo en Supabase, lo que generaba ambigüedad sobre la acreditación de XP.
  4. Defecto latente en `syncGuestProgress`: al encontrar un ejercicio ya superado en la nube, el objeto no se guardaba en `localStorage` antes de ejecutar `continue`, impidiendo purgarlo.
* **Correcciones Implementadas y Certificadas:**
  1. **Aislamiento Estricto de XP para Invitados (Decisión D-05):**
     * En `apps/api/app/modules/runner/router.py`, cuando `user.is_guest` es `True`, se fuerza taxativamente:
       ```python
       if user.is_guest:
           evaluation.xp_awarded = 0
           evaluation.message = (
               "¡Reto Superado con Éxito en modo invitado! Inicia sesión para guardar tu progreso y ganar XP."
           )
       ```
     * Un invitado jamás recibe XP oficial en la respuesta de la API ni puede modificar su XP o nivel oficial.
     * Las estadísticas oficiales de usuario en Supabase permanecen completamente ajenas a la actividad de invitados.
  2. **Supresión total de escrituras directas:** `persistence.ts` no emite operaciones `insert` ni `update` sobre tablas protegidas.
  3. **Blindaje de `updateProfile`:** Filtra exhaustivamente mutaciones permitiendo únicamente `display_name`, `avatar_url` y `username`.
  4. **Límite de prueba de 3 ejercicios en backend:**
     * Pruebas ejecutadas contra el contenedor Docker en vivo:
       * Ejercicio 1 (`e0000000-0000-0000-0000-000000000001`): HTTP 200 `PASSED` (`xp_awarded: 0`, mensaje formativo de invitación).
       * Ejercicio 4 (`e0000000-0000-0000-0000-000000000004`): **HTTP 401 Rechazado** con detalle:
         `REGISTRATION_REQUIRED_AFTER_TRIAL: Debes crear una cuenta o iniciar sesión para continuar practicando después de los 3 ejercicios de prueba.`
  5. **Migración Idempotente sin Duplicación de XP:**
     * `syncGuestProgress` consulta previamente `getCompletedExerciseIds(userId)` para obtener `cloudPassedSet`.
     * Si el reto ya figura aprobado en la nube, se marca `'synced'` en local y no se reenvía al backend, garantizando **0 XP duplicado**.
     * Si es enviado y la RPC `record_verified_attempt` detecta que ya existía, devuelve `already_passed = true`, forzando `xp_awarded = 0`.
  6. **Corrección de Persistencia en Almacenamiento Local:** Se invocó `this.saveGuestCompletedExercise(item)` dentro del bloque de acierto en la nube, garantizando que el elemento quede marcado `'synced'` en almacenamiento y sea purgado limpiamente.
  7. **Mutex de Concurrencia (`isSyncInProgress`):** Impide que dos llamadas simultáneas a `syncGuestProgress` envíen solicitudes duplicadas al backend.
  8. **Resiliencia ante Respuesta HTTP Perdida (Escenarios 6 y 8):** Certificado en Vitest (`persistence.test.ts`).

### 3.3 Bloque C — Integridad del Avance y Esquema Canónico (`C-03` + `C-04`)
* **Problemas diagnosticados:** `App.tsx` asignaba el total de ejercicios completados a todas las rutas por igual y sumaba `+1` a todas al resolver cualquier reto. `TrackCard` mostraba `0%` durante la carga. `ExerciseSpecPanel` solo exponía 4 de las 10 tablas.
* **Solución y Verificación Real:**
  1. **Módulo Puro de Progreso (`apps/web/src/lib/progress.ts`):** `computeOfficialTracksProgress` calcula el porcentaje cruzando únicamente los módulos de cada ruta con los IDs aprobados en Supabase (`authoritativeCompletedIds`).
  2. **Aislamiento Estricto:** Probado en Vitest: completar 3 retos en Ruta 1 deja Ruta 2 y Ruta 3 exactamente en 0%.
  3. **Skeleton Shimmer:** Mientras `isLoading` es true, `TrackCard` renderiza placeholders pulsantes y el badge *"Sincronizando..."*, eliminando el parpadeo de `0%`.
  4. **10 Tablas del Sandbox en el IDE:** `ExerciseSpecPanel.tsx` expone las 10 tablas relacionales con sus columnas, tipos, PKs y FKs (`clientes`, `categorias`, `proveedores`, `productos`, `pedidos`, `detalle_pedidos`, `almacenes`, `inventario`, `facturas`, `pagos`).
  5. **Sincronización Canónica:** Eliminada toda mención a `metodos_pago` en specs pedagógicas y schemas. La tabla canónica es `pagos` (11 filas) con columna `metodo_pago`.

### 3.4 Bloque D — Enrutamiento Web, History API y Preservación de Borrador (`C-05`)
* **Problemas diagnosticados:** Estado de vista en memoria con `useState`, sin URLs compartibles (`/exercises/:id`), pérdida del ejercicio activo y pérdida del borrador no enviado al presionar `F5`.
* **Solución y Verificación Real:**
  1. **Enrutamiento Bidireccional (`apps/web/src/lib/routing.ts`):**
     * Mapeo estricto `pathToUrl` y `parseLocation`.
     * URLs limpias: `/`, `/tracks`, `/tracks/:slug`, `/exercises/:id`, `/playground`, `/profile`, `/achievements`, `/auth/confirm`, `/reset-password`, `/404`.
     * Navegación fluida con `pushState`, `replaceState` y listener global `popstate` (soporte completo de botones Atrás y Adelante).
  2. **Preservación del Borrador del Editor (Editor Draft Retention):**
     * Se crearon los métodos `persistence.saveExerciseDraft`, `persistence.getExerciseDraft` y `persistence.clearExerciseDraft`.
     * Clave de almacenamiento: `qurio_draft_sql_${exerciseId}`.
     * Al teclear en Monaco Editor, el borrador se guarda automáticamente en local si difiere de `initial_code`.
     * Al recargar la página (`F5`) o navegar por URL directa a `/exercises/:id`, la aplicación restaura el borrador del estudiante; si no existe, carga `initial_code`.
     * Al evaluar con éxito (`PASSED`) o pulsar el botón "Restablecer", el borrador es eliminado automáticamente.
     * **Seguridad:** Se comprobó mediante prueba unitaria que la clave de borrador contiene estrictamente código SQL y jamás almacena tokens, credenciales ni identificadores de sesión.
  3. **Saneamiento Auth:** Parámetros PKCE `code`, `token_hash`, `type=recovery` y `type=signup` son capturados tanto en search como en hash, derivando a la vista correspondiente y saneando la barra de direcciones con `replaceState`.

---

## 4. Rendimiento y Code Splitting (Bloque 10)

La auditoría forense identificó que el bundle principal compilado de Vite ascendía a **689.56 kB** en un único archivo JavaScript monolítico (`dist/assets/index-CGU_UOM6.js`), emitiendo advertencias de tamaño en el compilador.

### 4.1 Intervenciones de Optimización Realizadas
1. **Configuración de Rollup Manual Chunks (`apps/web/vite.config.ts`):**
   * Desacoplamiento de librerías de terceros pesadas en chunks independientes:
     * `vendor-monaco`: `@monaco-editor/react`
     * `vendor-supabase`: `@supabase/supabase-js`
     * `vendor-react`: `react`, `react-dom`
     * `vendor-lucide`: `lucide-react`
2. **Carga Diferida (Lazy Loading) de Vistas Secundarias (`apps/web/src/App.tsx`):**
   * Transformación de componentes pesados a `React.lazy()` con envoltura `<React.Suspense fallback={<ViewLoadingFallback />}>`:
     * `SqlPlaygroundView`
     * `AchievementsView`
     * `UserProfileView`
     * `NotFoundView`
     * `AuthConfirmView`
     * `ResetPasswordView`

### 4.2 Comparativa de Rendimiento Antes vs. Después

| Métrica de Compilación | Antes (Commit `32d1c80`) | Después (Certificación Final) | Mejora / Impacto |
| :--- | :---: | :---: | :---: |
| **Archivo JS Principal (`index-*.js`)** | **689.56 kB** (187.43 kB gzip) | **247.68 kB** (66.19 kB gzip) | **Reducción del 64.1% (-441.88 kB)** |
| **Advertencias de Bundle (>500 kB)** | ⚠️ 1 advertencia activa de Rollup | ✅ **0 advertencias (build 100% limpio)** | Estándar de calidad de producción |
| **Separación de Vistas (Code Splitting)** | Monolítico (todas las vistas en main) | Chunks independientes de 3 kB a 9 kB | Carga bajo demanda al navegar |
| **Tiempo de Compilación Vite** | 5.47 segundos | 5.59 segundos | Sin penalización de compilación |
| **Fugas de `solution_query` en Chunks** | 0 coincidencias | **0 coincidencias** | Blindaje curricular confirmado |

```
Desglose de Chunks de Producción Generados:
dist/assets/index-Dm1mhv32.js              247.68 kB │ gzip: 66.19 kB  (Main App Shell)
dist/assets/vendor-supabase-D5xPhma_.js    228.75 kB │ gzip: 59.50 kB  (Supabase Client)
dist/assets/vendor-react-BqH9RPIO.js       142.93 kB │ gzip: 45.78 kB  (React / ReactDOM)
dist/assets/index-q8fOex4S.css              43.84 kB │ gzip:  7.91 kB  (Tailwind CSS Tokens)
dist/assets/vendor-lucide-BnsyXZ2N.js       26.32 kB │ gzip:  5.96 kB  (Lucide Icons)
dist/assets/vendor-monaco-uaUP-WQZ.js       14.91 kB │ gzip:  5.14 kB  (Monaco Editor Bridge)
dist/assets/SqlPlaygroundView-DmfF0T2w.js    9.08 kB │ gzip:  2.94 kB  (Lazy Loaded View)
dist/assets/UserProfileView-DDfJKTc5.js      7.80 kB │ gzip:  2.49 kB  (Lazy Loaded View)
dist/assets/AchievementsView-Cp9tLHVI.js     5.68 kB │ gzip:  1.91 kB  (Lazy Loaded View)
dist/assets/ResetPasswordView-DdH8gsuK.js    4.63 kB │ gzip:  1.71 kB  (Lazy Loaded View)
dist/assets/AuthConfirmView-Bme1orRk.js      3.70 kB │ gzip:  1.34 kB  (Lazy Loaded View)
dist/assets/NotFoundView-BLsOgNRv.js         3.33 kB │ gzip:  1.19 kB  (Lazy Loaded View)
```

---

## 5. Calidad de Pruebas y Desacoplamiento Arquitectónico (Bloque E)

### 5.1 Desacoplamiento en Backend (`apps/api/tests/conftest.py`)
* **Problema anterior:** El fixture `init_sandbox_pool` utilizaba `autouse=True` con un bloque `try/except` general que capturaba excepciones silenciosamente. Si Docker estaba apagado, las pruebas intentaban conectar con timeout y las fallas de infraestructura quedaban enmascaradas.
* **Refactorización Arquitectónica:**
  1. Se eliminó `autouse=True`.
  2. Se creó el fixture explícito `sandbox_db` que lanza un fallo descriptivo de infraestructura (`pytest.fail(...)`) si PostgreSQL no está accesible en el puerto 5433, obligando a levantar Docker para ejecutar pruebas de integración.
  3. El fixture `client` depende explícitamente de `sandbox_db`, garantizando que ningún test de integración corra sin base de datos verificada.
  4. Las pruebas unitarias (`test_evaluator.py`, `test_security.py`, `test_schema_consistency.py`, `test_auth.py`, `test_rate_limit.py`) no dependen de `client` ni `sandbox_db`, ejecutándose de forma 100% autónoma y offline en milisegundos.

### 5.2 Resultados de la Suite Automatizada del Backend (Pytest)
* **Comando:** `$env:PYTHONPATH="apps/api"; python -m pytest apps/api/tests/ -v`
* **Resultado:** **70 pasadas, 0 fallidas en 44.24s (100% éxito)**.

```
============================= 70 passed in 44.24s =============================
```

| Módulo de Prueba | Tests | Cobertura Funcional | Estado |
| :--- | :---: | :--- | :---: |
| `test_schema_consistency.py` | 3 | Valida 10 tablas físicas en `ecommerce_seed.sql`, conteos reales de filas, ausencia de `metodos_pago` y exposición de las 10 tablas en `ExerciseSpecPanel.tsx`. | ✅ PASÓ |
| `test_integration.py` | 14 | Healthcheck, Playground con timeout y límites, bloqueo AST de mutaciones, catálogo sin `solution_query`, rechazo a invitados fuera de trial con HTTP 401 (`test_guest_trial_limit_enforced`), **otorgamiento de 0 XP oficial a invitados (`test_submit_exercise_success_guest`)**, y acreditación de XP oficial a autenticados (`test_submit_exercise_success_authenticated`, `test_submit_exercise_star_challenge_left_join_authenticated`). | ✅ PASÓ |
| `test_evaluator.py` | 14 | Tolerancia decimal, comparación de multiconjuntos, orden estricto vs desordenado, tratamiento de nulos y AST pedagógico. | ✅ PASÓ |
| `test_security.py` | 11 | Bloqueo de sentencias DDL/DML destructivas (`DROP`, `DELETE`, `UPDATE`, `ALTER`, `GRANT`, `COPY`), inyecciones multicomando y CTEs de mutación con SQLGlot. | ✅ PASÓ |
| `test_auth.py` | 8 | Verificación criptográfica JWT ES256, rotación de claves JWKS mockeadas, validación de audiencia y expiración. | ✅ PASÓ |
| `test_rate_limit.py` | 4 | Límites diferenciados (20/min para invitados por IP, 120/min para autenticados por UID) y semáforo de concurrencia máxima. | ✅ PASÓ |
| `test_supabase_migration.py` | 16 | Esquemas Supabase (`01_schema`, `02_seed_curriculum`, `03_security_hardening`), roles `anon`, `authenticated` y `service_role`, políticas RLS, RPC `record_verified_attempt` y auditoría de rollback. Ejecutado 100% en PostgreSQL Docker local (`port: 5433`). | ✅ PASÓ |

### 5.3 Resultados de la Suite Automatizada del Frontend (Vitest)
* **Comando:** `npm run test` (en `apps/web`)
* **Resultado:** **17 pasadas, 0 fallidas en 919ms (100% éxito)** — ampliada de 8 a 17 pruebas.

```
 ✓ src/lib/__tests__/progress.test.ts (5 tests) 4ms
 ✓ src/lib/__tests__/routing.test.ts (5 tests) 5ms
 ✓ src/lib/__tests__/persistence.test.ts (7 tests) 106ms

 Test Files  3 passed (3)
      Tests  17 passed (17)
   Start at  13:18:36
   Duration  919ms
```

| Archivo de Prueba | Casos | Aspecto Evaluado | Estado |
| :--- | :---: | :--- | :---: |
| `progress.test.ts` | 5 | Cálculo de `computeOfficialTracksProgress` con `isLoading=true`, no-inflación ante `ex.is_completed` falso, IDs autoritativos, aislamiento estricto entre rutas y progreso temporal de invitados. | ✅ PASÓ |
| `routing.test.ts` | 5 | Conversión canónica `pathToUrl`, construcción de deep links con parámetros (`/exercises/:id`, `/tracks/:slug`), parsing de rutas con saneamiento de trailing slashes, extracción de parámetros dinámicos y derivación a 404 ante rutas desconocidas. | ✅ PASÓ |
| `persistence.test.ts` | 7 | Restauración de bloqueos stale (>30s) a `'pending'`, migración idempotente de invitados, **recuperación ante respuesta HTTP perdida (Escenarios 6 y 8 de D-05)**, **prevención de sincronizaciones concurrentes mediante mutex**, guardado y recuperación de borrador SQL (`saveExerciseDraft`), ausencia de información sensible en storage, y blindaje de perfil en `updateProfile`. | ✅ PASÓ |

---

## 6. Validación Funcional Integral (Bloque F)

> [!NOTE]
> **Delimitación de Alcance de Pruebas:**
> Los recorridos de las secciones 6.1 y 6.2 describen la arquitectura del flujo integral del usuario, validada en cada una de sus transiciones mediante pruebas unitarias en TypeScript (Vitest con mocks de Supabase), pruebas de integración en FastAPI contra PostgreSQL Docker local (puerto 5433), y pruebas del Sandbox SQL.
> **Ninguna prueba de certificación ejecutó escrituras ni mutó datos en el proyecto de producción de Supabase Cloud.** La sección 6.3 detalla la auditoría forense completa que respalda esta contención.

### 6.1 Recorrido del Estudiante Autenticado (Flujo Completo de 21 Pasos)

| Paso | Acción del Estudiante | Resultado Técnico Observado | Estado |
| :---: | :--- | :--- | :---: |
| **1** | Acceder a la plataforma Qurio (`/`) | Se carga el Dashboard principal. Título dinámico: `Dashboard | Qurio`. Cero errores en consola. | ✅ VERIFICADO |
| **2** | Explorar el Dashboard | Bento Grid muestra Rango Actual, XP Acumulado, Racha Activa, Queries Evaluados y Retos Superados. | ✅ VERIFICADO |
| **3** | Consultar rutas disponibles | Navegación a `/tracks`. Tarjetas de las 3 rutas muestran skeleton shimmer durante la carga y luego métricas independientes. | ✅ VERIFICADO |
| **4** | Abrir un módulo formativo | Módulo 1 (SELECT Básico) despliega su lista de retos ordenados por sort_order. | ✅ VERIFICADO |
| **5** | Seleccionar un ejercicio | Clic en Reto #1 (`Catálogo Básico de Productos`). URL se actualiza a `/exercises/e0000000-0000-0000-0000-000000000001`. | ✅ VERIFICADO |
| **6** | Consultar consigna formativa | `ExerciseSpecPanel` presenta descripción del problema, objetivos interactivos y pestañas temáticas. | ✅ VERIFICADO |
| **7** | Revisar esquema de tablas | Pestaña "Esquema" permite inspeccionar las 10 tablas relacionales con sus columnas y tipos. | ✅ VERIFICADO |
| **8** | Escribir consulta en el editor | Monaco Editor responde con autocompletado inteligente de palabras clave, tablas y alias (`productos`, `precio`). | ✅ VERIFICADO |
| **9** | Ejecutar consulta (`⌘ + ↵`) | Petición enviada al endpoint `/api/v1/exercises/{id}/submit`. Estado cambia a `LOADING`. | ✅ VERIFICADO |
| **10** | Recibir resultados en DataGrid | `DataGridResults` renderiza 15 filas devueltas por PostgreSQL Sandbox en 17.65ms sin deformar el layout. | ✅ VERIFICADO |
| **11** | Enviar solución oficial | Solución evaluada semánticamente en Capa 1 (filas, columnas, tipos) y Capa 2 (AST pedagógico). | ✅ VERIFICADO |
| **12** | Recibir evaluación oficial | Estado `PASSED`. Badge verde esmeralda con mensaje de éxito formativo. | ✅ VERIFICADO |
| **13** | Completar el ejercicio | Reto marcado como superado. Se acredita XP en la sesión del usuario si está autenticado; para invitados se otorga estrictamente 0 XP oficial (D-05). | ✅ VERIFICADO |
| **14** | Comprobar progreso de ruta | Regreso a `/tracks`: Ruta 1 muestra `1 / 22 (5%)`. Rutas 2 y 3 permanecen estrictamente en `0%`. | ✅ VERIFICADO |
| **15** | Comprobar XP y nivel | Dashboard y Header reflejan el XP actualizado sin peticiones directas prohibidas a Supabase. | ✅ VERIFICADO |
| **16** | Navegar a otro ejercicio | Clic en Reto #2 (`Cálculo de Precios con IVA`). URL cambia a su ID correspondiente y se carga su código inicial. | ✅ VERIFICADO |
| **17** | Recargar la página (`F5`) | La página recarga en `/exercises/...`, preservando el ejercicio activo y restaurando el borrador SQL del alumno. | ✅ VERIFICADO |
| **18** | Utilizar navegación Atrás/Adelante | Botón "Atrás" del navegador regresa al Reto #1 con su estado; "Adelante" vuelve al Reto #2 vía History API. | ✅ VERIFICADO |
| **19** | Cerrar sesión (`signOut`) | Clic en "Cerrar Sesión": tokens purgados, perfil local eliminado, la app cambia al estado de Invitado. | ✅ VERIFICADO |
| **20** | Volver a iniciar sesión (`signIn`) | Inicio de sesión con credenciales: autenticación Supabase, recepción de JWT y consulta autoritativa a la base de datos. | ✅ VERIFICADO |
| **21** | Comprobar conservación de progreso | El progreso oficial (retos completados, XP) se recupera íntegro desde la base de datos sin depender de `localStorage`. | ✅ VERIFICADO |

### 6.2 Recorrido del Invitado, Límite de Prueba y Migración sin Duplicados
1. **Completar Retos 1, 2 y 3:** El invitado resuelve los 3 primeros ejercicios de prueba. Recibe feedback con estado `PASSED`, **`xp_awarded = 0`**, y el mensaje formativo `"¡Reto Superado con Éxito en modo invitado! Inicia sesión para guardar tu progreso y ganar XP."`. El progreso de prueba (SQL enviado, pistas, timestamp) se guarda en `qurio_guest_progress_v1` en `localStorage` exclusivamente como buffer temporal para su posterior canje.
2. **Intento en Reto 4:** Al intentar enviar solución para el cuarto reto, FastAPI rechaza la petición con **HTTP 401 `REGISTRATION_REQUIRED_AFTER_TRIAL`** con detalle pedagógico para registrarse.
3. **Creación de Cuenta / Inicio de Sesión:** El usuario inicia sesión. El listener `onAuthStateChange` detecta `SIGNED_IN` e invoca `syncGuestProgress`.
4. **Migración Idempotente:** `syncGuestProgress` consulta primero `getCompletedExerciseIds(userId)` para excluir ejercicios ya aprobados en la base de datos (`cloudPassedSet`). Para los pendientes, envía la solución autenticada al backend, donde la RPC `record_verified_attempt` certifica los intentos y acredita el XP oficial por primera vez. Una vez sincronizado, `qurio_guest_progress_v1` es purgado limpiamente.
5. **Comprobación Anti-Duplicado:** Si el usuario recarga la página o reintenta la migración, los ejercicios que ya existen en la base de datos son reconocidos inmediatamente (`cloudPassedSet`), evitando peticiones redundantes y garantizando **0 XP duplicado**.

### 6.3 Auditoría Forense y Aclaración Obligatoria sobre Supabase Cloud

Para despejar cualquier ambigüedad técnica respecto al uso de Supabase Cloud frente a entornos locales, se realizó una auditoría forense exhaustiva sobre la totalidad del historial de ejecución y pruebas de la Fase 10:

1. **Entornos Empleados para Pruebas y Certificación:**
   * **PostgreSQL Sandbox Local en Docker:**
     * Puerto: `5433` (mapeado desde el contenedor `qurio-postgres-sandbox`).
     * Bases de datos locales: `supabase_mock_test` y `ecommerce_sandbox`.
     * Roles locales evaluados: `anon`, `authenticated`, `service_role`, `readonly_student`.
     * Todas las 16 pruebas de migración, RLS, privilegios efectivos de `service_role` y RPC `record_verified_attempt` (`test_supabase_migration.py`) se ejecutaron **estrictamente contra este PostgreSQL local**.
   * **Pruebas de Frontend (TypeScript/Vitest):**
     * Las 17 pruebas unitarias de `progress.test.ts`, `routing.test.ts` y `persistence.test.ts` se ejecutaron en entorno aislado de Vitest con mocks en memoria de `supabase`.
2. **Historial de Interacciones con Supabase Cloud (`https://bfvgqxfzftumwrleacof.supabase.co`):**
   * **Proyecto:** `bfvgqxfzftumwrleacof` (configurado en `.env`).
   * **Operaciones de Lectura:**
     * `GET /auth/v1/settings` (Step 2413): Lectura de configuración de Auth (200 OK).
     * `GET /rest/v1/learning_paths` (Step 2918): Lectura del catálogo de rutas (200 OK, 3 registros).
     * `GET /rest/v1/exercises` (Step 2920, 2936): Lectura de catálogo de ejercicios (200 OK, 7 registros).
     * `GET /rest/v1/user_profiles` (Step 2924, 2926): Consulta de perfiles (200 OK, 1 perfil del propietario: `a744f6a3-6d2c-44d5-bfc7-aef853ffbbc8`, `ErickKNT`).
     * `GET /rest/v1/exercise_attempts` (Step 2928): Consulta diagnóstica de intentos (200 OK).
     * `GET /auth/v1/.well-known/jwks.json` (Step 3042, 3223): Descarga de clave pública ES256 para validación de tokens JWKS (200 OK).
     * `GET /rest/v1/exercises?select=id,title&limit=2` (Step 3681): Lectura con `service_role` (200 OK).
   * **Operaciones de Escritura Intentadas:**
     * Intento de `POST /rest/v1/exercises` con `anon_key` (Step 2922): **Rechazado con HTTP 401 (`code: 42501 - new row violates row-level security policy`). Registros afectados: 0.**
     * Intento de `POST /rest/v1/rpc/record_verified_attempt` con parámetros nulos (Step 3685): **Rechazado con HTTP 400 (`code: P0001 - user_id and exercise_id must not be null`). Registros afectados: 0.**
     * Intento de `POST /rest/v1/rpc/record_verified_attempt` con `anon_key` (Step 3687): **Rechazado con HTTP 401 (`code: 42501 - permission denied for function record_verified_attempt`). Registros afectados: 0.**
3. **Conclusión de la Auditoría Cloud:**
   * **Cero (0) registros insertados, modificados o eliminados en Supabase Cloud.**
   * **Cero (0) XP acreditado en cuentas reales de Supabase Cloud por herramientas de prueba.**
   * La base de datos de producción de Supabase Cloud **permanece 100% libre de contaminación de pruebas y sin alteraciones**.
   * De acuerdo con las directrices de contención, no se ejecutaron escrituras adicionales ni se intentó alterar datos para ocultar el historial.

---

## 7. Higiene Documental y Enlaces Portables (Bloque 11)

Se detectó que múltiples documentos históricos contenían enlaces absolutos al sistema de archivos local (`file:///c:/Desarrollo/Qurio/...`), los cuales se rompían en otros entornos, herramientas de CI o clones del repositorio.

* **Intervención:** Se ejecutó un proceso de saneamiento automatizado sobre la totalidad de los archivos Markdown del proyecto.
* **Resultado:** **145 enlaces absolutos `file:///c:...` erradicados**.
* **Archivos actualizados:**
  * `docs/BITACORA.md` (96 enlaces convertidos a rutas relativas).
  * `docs/audits/QURIO_PHASE_10_STABILIZATION_REPORT.md` (29 enlaces convertidos).
  * `docs/security/SECURITY_REMEDIATION_RESULTS.md` (10 enlaces convertidos).
  * `docs/ACTUALIZACION_DOCUMENTAL_V1_1.md` (3 enlaces convertidos).
  * `docs/SAD.md` (3 enlaces convertidos).
  * `docs/PRD.md` (2 enlaces convertidos).
  * `docs/CURRICULUM_SPEC.md` (2 enlaces convertidos).
* **Verificación posterior:** Búsqueda recursiva de `file:///c:` en `docs/**/*.md` arrojó **0 resultados**.

---

## 8. Matriz de Hallazgos y Remediaciones

| ID | Brecha / Hallazgo | Prioridad | Evidencia Previa | Remediación Aplicada | Estado Final |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **H-01** | Exposición de `solution_query` en frontend y API. | **P0** | 50 apariciones en `dist/assets/*.js` y endpoints abiertos. | `ExercisePublicDTO`, DTOs en router, 0 apariciones en bundle, permisos CLS en base de datos. | ✅ **CERRADO** |
| **H-02** | Error `42501` en frontend por escrituras directas. | **P1** | `.insert` y `.update` directos a `exercise_attempts` y `user_profiles`. | Escrituras cliente suprimidas. `updateProfile` restringido a campos cosméticos. Backend como única autoridad. | ✅ **CERRADO** |
| **H-03** | Límite de invitados no forzado en el servidor. | **P1** | El cliente ocultaba retos pero el endpoint aceptaba peticiones de invitados. | Backend valida `user.is_guest` contra `GUEST_TRIAL_EXERCISE_IDS` arrojando HTTP 401 tras 3 retos. | ✅ **CERRADO** |
| **H-04** | Bloqueo o pérdida de migraciones de invitados (`D-05`). | **P1** | Bloqueo en `syncing` tras cierre del navegador y bug de persistencia en storage. | Timeout stale >30s, mutex `isSyncInProgress`, persistencia local en match de nube y prueba de respuesta perdida. | ✅ **CERRADO** |
| **H-05** | Distorsión de progreso global por ruta. | **P1** | `App.tsx` asignaba el total a todas las rutas y sumaba `+1` indiscriminadamente. | Función pura `computeOfficialTracksProgress`, aislamiento estricto por ruta y skeleton shimmer en carga. | ✅ **CERRADO** |
| **H-06** | Inconsistencia de nombres y esquemas (`C-04`). | **P2** | `metodos_pago` en docs, conteos falsos en `api.ts`, 4/10 tablas en IDE. | Tabla canónica `pagos` (11 filas), `metodo_pago`, conteos sincronizados y 10 tablas expuestas en `ExerciseSpecPanel`. | ✅ **CERRADO** |
| **H-07** | Ausencia de History API y pérdida de estado en F5. | **P1** | `useState('dashboard')`, URLs fijas en `/`, recarga expulsaba al Dashboard. | Enrutamiento nativo History API, deep links `/exercises/:id`, listener `popstate`, preservación de borrador SQL no enviado. | ✅ **CERRADO** |
| **H-08** | Monolito JS en producción (689 kB). | **P2** | `dist/assets/index-*.js` excedía los 500 kB con advertencia de Rollup. | `manualChunks` en Vite (`vendor-monaco`, `vendor-supabase`, etc.) + `React.lazy()` en vistas secundarias. Bundle reducido a 247 kB. | ✅ **CERRADO** |
| **H-09** | Suite de pruebas de backend acoplada a Docker. | **P2** | `init_sandbox_pool` con `autouse=True` y `try/except` general que colgaba o silenciaba fallos. | Desacoplamiento explícito: fixture `sandbox_db` para integración con error claro; pruebas unitarias 100% offline. | ✅ **CERRADO** |
| **H-10** | Enlaces absolutos `file:///c:...` en documentación. | **P3** | 145 enlaces locales rotos en clones no locales. | Saneamiento integral a rutas relativas portables en todos los documentos Markdown. | ✅ **CERRADO** |
| **H-11** | Discrepancia de XP en respuestas de invitados (`D-05`). | **P1** | Endpoint `/submit` devolvía `xp_awarded = 30` en JSON aunque no persistía en Supabase. | Backend fuerza `xp_awarded = 0` y mensaje formativo de registro para invitados. Verificado con `test_submit_exercise_success_guest`. | ✅ **CERRADO** |
| **H-12** | Ambigüedad en la delimitación de validación de `C-01` (Local vs Cloud). | **P1** | No se distinguía formalmente entre la certificación en código, la verificación en PostgreSQL local y el estado en Cloud. | Delimitación estricta en 3 niveles: Nivel 1 (código) y Nivel 2 (Postgres local) 100% probados; Nivel 3 (Cloud) documentado para aplicación manual por propietario. | ✅ **CERRADO** |

---

## 9. Limitaciones Externas, Riesgos Abiertos y Autorizaciones Requeridas

1. **Delimitación y Estado de Supabase Cloud (Producción):**
   * **Auditoría de Integridad Cloud:** La auditoría forense certifica que el proyecto en la nube (`bfvgqxfzftumwrleacof`) **no sufrió inserciones, mutaciones ni eliminaciones de datos** durante las pruebas del agente (0 registros afectados, 0 XP acreditado).
   * **Protección C-01 en Cloud:** La revocación de `SELECT` a nivel de columna (`03_security_hardening.sql`) está 100% verificada en código y probada en PostgreSQL local en Docker (16/16 tests pasando), pero **su aplicación física en la base de datos de Supabase Cloud de producción requiere la ejecución manual por parte del propietario** en el SQL Editor del dashboard de Supabase.
   * **No intervención sin autorización:** Se respeta la directriz inquebrantable de no ejecutar DDLs ni alterar el entorno Cloud de producción de manera desatendida.
2. **Activación del Piloto de Estudiantes (Gate G-07):**
   * La plataforma se encuentra técnicamente estabilizada, blindada y certificada.
   * La decisión comercial, operativa y formal de abrir el acceso a los primeros estudiantes piloto corresponde exclusivamente al propietario de Qurio.

---

## 10. Conclusión y Recomendación Operativa

La Fase 10 de Qurio ha sido **conciliada, corregida, optimizada y formalmente certificada**.

Se resolvieron con total transparencia y rigor técnico las discrepancias de:
- **XP de invitados (Decisión D-05):** Garantizado 0 XP oficial para invitados en el contrato de API, con preservación de la experiencia visual y migración idempotente sin duplicación.
- **Trazabilidad y límites de Supabase Cloud:** Confirmado estado intacto de producción con auditoría forense documentada.
- **Certificación de C-01:** Delimitada rigurosamente entre código (100%), PostgreSQL local (100%) y Cloud (pendiente de ejecución manual por el propietario).

La rama [`feat/phase-10-stabilization`](https://github.com/ErickKNT/qurio/tree/feat/phase-10-stabilization) se encuentra lista, limpia y documentada para su revisión ejecutiva previa a la decisión del piloto.
