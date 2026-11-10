# Qurio — Informe Final de Certificación Técnica y Cierre de Fase 10

| Metadato | Detalle |
| :--- | :--- |
| **Identificador del Documento** | `QURIO-PHASE-10-CERTIFICATION-FINAL` |
| **Identificador de Tarea** | `QURIO-PHASE-10-CORRECTIVE-VALIDATION-01` |
| **Fecha de Certificación** | 10 de noviembre de 2026 |
| **Rama de Trabajo Autorizada** | [`feat/phase-10-stabilization`](https://github.com/ErickKNT/qurio/tree/feat/phase-10-stabilization) |
| **Genealogía Git** | Ramificada desde `docs/operational-baseline-v1` y `main` (`add8b6d`). Commits: `32d1c80` (estabilización), `f2abc4b` (informe preliminar), commit actual de certificación correctiva. |
| **Estado del Árbol Git** | **Limpio, 0 archivos huérfanos, 0 modificaciones en main, 0 push a origin, 0 despliegue público.** |
| **Estado de Verificación** | **100% Automatizado y Probado en Vivo: 69/69 Pytest + 17/17 Vitest + Build TypeScript 0 Errores + Contenedores Docker Probados** |
| **Documentos Vinculados** | [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`](../product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md) (v1.2)<br>[`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) (v1.2)<br>[`docs/audits/QURIO_OPERATIONAL_AUDIT.md`](QURIO_OPERATIONAL_AUDIT.md) (v1.1)<br>[`docs/roadmap/QURIO_OPERATIONAL_BASELINE.md`](../roadmap/QURIO_OPERATIONAL_BASELINE.md) (v1.1)<br>[`docs/BITACORA.md`](../BITACORA.md) (Entradas 24 y 25) |

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
* **Solución y Verificación Real:**
  1. **Backend:** Se implementó `ExercisePublicDTO` en `seed_data.py`. `repository.py` proyecta únicamente `list_public()` y `get_public_by_id()`. El evaluador interno (`router.py`) consulta `get_internal_for_evaluation()`, manteniendo la consulta solución confinada en el servidor.
  2. **Verificación en Vivo con Docker:**
     * `curl http://127.0.0.1:8000/api/v1/exercises`: Devuelve 50 retos con claves públicas. `Contains solution_query: False`.
     * `curl http://127.0.0.1:8000/api/v1/exercises/e0000000-0000-0000-0000-000000000001`: Devuelve `ExercisePublicDTO`. `Has solution_query: False`.
  3. **Frontend:** Interfaz `Exercise` en `types/index.ts` y 50 retos en `FALLBACK_EXERCISES` de `api.ts` purgados.
  4. **Bundle de Producción:** Búsqueda en `dist/assets/*.js` de `solution_query` arrojó **0 coincidencias**.
  5. **Permisos Supabase/PostgreSQL:** Documentado y estructurado el script DDL con `REVOKE SELECT ON exercises FROM PUBLIC, anon, authenticated;` y `GRANT SELECT (...)` restringido a columnas públicas, dejando `solution_query` accesible exclusivamente al rol `service_role` (FastAPI).

### 3.2 Bloque B — Persistencia, Límite de Invitados y Migración Resiliente (`C-02` + `D-05`)
* **Problemas diagnosticados:**
  1. Escrituras directas del navegador a tablas protegidas (`exercise_attempts`, `user_profiles.xp`) que generaban errores `42501`.
  2. Ausencia de candado ante invocaciones concurrentes de migración de progreso de invitados.
  3. **Defecto latente detectado en la auditoría de código:** En `syncGuestProgress`, al encontrar un ejercicio que ya estaba superado en la nube (`cloudPassedSet.has(item.exercise_id)`), el objeto se marcaba en memoria como `'synced'`, pero no se persistía en `localStorage` antes de ejecutar `continue`. Esto impedía purgar el elemento local al concluir el ciclo si la lista se releía del storage.
* **Correcciones Implementadas:**
  1. **Supresión total de escrituras directas:** `persistence.ts` no emite operaciones `insert` ni `update` sobre tablas protegidas.
  2. **Blindaje de `updateProfile`:** Filtra exhaustivamente mutaciones permitiendo únicamente `display_name`, `avatar_url` y `username`.
  3. **Límite de prueba de 3 ejercicios en backend:**
     * Pruebas ejecutadas contra el contenedor Docker en vivo:
       * Ejercicio 1 (`e0000000-0000-0000-0000-000000000001`): HTTP 200 `PASSED` (+30 XP otorgados en modo invitado).
       * Ejercicio 4 (`e0000000-0000-0000-0000-000000000004`): **HTTP 401 Rechazado** con detalle:
         `REGISTRATION_REQUIRED_AFTER_TRIAL: Debes crear una cuenta o iniciar sesión para continuar practicando después de los 3 ejercicios de prueba.`
  4. **Corrección de Persistencia en Migración Idempotente:**
     * Se invocó `this.saveGuestCompletedExercise(item)` dentro del bloque de acierto en la nube, garantizando que el elemento quede marcado `'synced'` en almacenamiento y sea purgado limpiamente.
  5. **Mutex de Concurrencia (`isSyncInProgress`):** Impide que dos llamadas simultáneas a `syncGuestProgress` (ej. doble clic o eventos simultáneos de auth) envíen solicitudes duplicadas al backend.
  6. **Resiliencia ante Respuesta HTTP Perdida (Escenarios 6 y 8):**
     * Si el backend registra el intento pero la red se interrumpe antes de recibir la respuesta HTTP, el reintento consulta `getCompletedExerciseIds(userId)` -> detecta el reto en `cloudPassedSet` -> lo marca `'synced'` -> omite llamadas a la API -> purga el almacén local sin otorgar XP duplicado.
     * Probado y certificado en Vitest (`persistence.test.ts`).

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
* **Comando:** `$env:PYTHONPATH="apps/api"; python -m pytest apps/api/tests/ -q`
* **Resultado:** **69 pasadas, 0 fallidas en 44.39s (100% éxito)**.

```
.....................................................................    [100%]
69 passed in 44.39s
```

| Módulo de Prueba | Tests | Cobertura Funcional | Estado |
| :--- | :---: | :--- | :---: |
| `test_schema_consistency.py` | 3 | Valida 10 tablas físicas en `ecommerce_seed.sql`, conteos reales de filas, ausencia de `metodos_pago` y exposición de las 10 tablas en `ExerciseSpecPanel.tsx`. | ✅ PASÓ |
| `test_integration.py` | 13 | Healthcheck, Playground con timeout y límites, bloqueo AST de mutaciones, catálogo sin `solution_query`, rechazo a invitados fuera de trial con HTTP 401 (`test_guest_trial_limit_enforced`), y acreditación de XP a autenticados (`test_submit_exercise_star_challenge_left_join_authenticated`). | ✅ PASÓ |
| `test_evaluator.py` | 14 | Tolerancia decimal, comparación de multiconjuntos, orden estricto vs desordenado, tratamiento de nulos y AST pedagógico. | ✅ PASÓ |
| `test_security.py` | 11 | Bloqueo de sentencias DDL/DML destructivas (`DROP`, `DELETE`, `UPDATE`, `ALTER`, `GRANT`, `COPY`), inyecciones multicomando y CTEs de mutación con SQLGlot. | ✅ PASÓ |
| `test_auth.py` | 8 | Verificación criptográfica JWT ES256, rotación de claves JWKS mockeadas, validación de audiencia y expiración. | ✅ PASÓ |
| `test_rate_limit.py` | 4 | Límites diferenciados (20/min para invitados por IP, 120/min para autenticados por UID) y semáforo de concurrencia máxima. | ✅ PASÓ |
| `test_supabase_migration.py` | 16 | Esquemas Supabase (`01_schema`, `02_seed_curriculum`, `03_security_hardening`), roles `anon` y `authenticated`, políticas RLS, RPC `record_verified_attempt` y auditoría de rollback. | ✅ PASÓ |

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
| **13** | Completar el ejercicio | Reto marcado como superado. Se acredita XP en la sesión del usuario. | ✅ VERIFICADO |
| **14** | Comprobar progreso de ruta | Regreso a `/tracks`: Ruta 1 muestra `1 / 22 (5%)`. Rutas 2 y 3 permanecen estrictamente en `0%`. | ✅ VERIFICADO |
| **15** | Comprobar XP y nivel | Dashboard y Header reflejan el XP actualizado sin peticiones directas prohibidas a Supabase. | ✅ VERIFICADO |
| **16** | Navegar a otro ejercicio | Clic en Reto #2 (`Cálculo de Precios con IVA`). URL cambia a su ID correspondiente y se carga su código inicial. | ✅ VERIFICADO |
| **17** | Recargar la página (`F5`) | La página recarga en `/exercises/...`, preservando el ejercicio activo y restaurando el borrador SQL del alumno. | ✅ VERIFICADO |
| **18** | Utilizar navegación Atrás/Adelante | Botón "Atrás" del navegador regresa al Reto #1 con su estado; "Adelante" vuelve al Reto #2 vía History API. | ✅ VERIFICADO |
| **19** | Cerrar sesión (`signOut`) | Clic en "Cerrar Sesión": tokens purgados, perfil local eliminado, la app cambia al estado de Invitado. | ✅ VERIFICADO |
| **20** | Volver a iniciar sesión (`signIn`) | Inicio de sesión con credenciales: autenticación Supabase, recepción de JWT y consulta autoritativa a la nube. | ✅ VERIFICADO |
| **21** | Comprobar conservación de progreso | El progreso oficial (1 reto completado, XP) se recupera íntegro desde la nube sin depender de `localStorage`. | ✅ VERIFICADO |

### 6.2 Recorrido del Invitado y Límite de Prueba
1. **Completar Retos 1, 2 y 3:** El invitado resuelve los 3 primeros ejercicios de prueba. Recibe feedback de éxito con mensaje formativo para crear cuenta. El progreso se guarda en `qurio_guest_progress_v1`.
2. **Intento en Reto 4:** Al intentar enviar solución para el cuarto reto, FastAPI rechaza la petición con **HTTP 401 `REGISTRATION_REQUIRED_AFTER_TRIAL`**.
3. **Creación de Cuenta / Inicio de Sesión:** El usuario inicia sesión. El listener `onAuthStateChange` detecta `SIGNED_IN` e invoca `syncGuestProgress`.
4. **Migración Idempotente:** Los 3 retos locales son evaluados con el token del usuario y certificados en Supabase Cloud vía RPC. `qurio_guest_progress_v1` es purgado limpiamente.
5. **Comprobación Anti-Duplicado:** Si el usuario recarga la página o reintenta la migración, los ejercicios que ya existen en la nube son reconocidos inmediatamente (`cloudPassedSet`), evitando peticiones redundantes y garantizando **0 XP duplicado**.

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

---

## 9. Limitaciones Externas, Riesgos Abiertos y Autorizaciones Requeridas

1. **Entorno Supabase Cloud (Producción):**
   * Por directriz estricta, esta certificación no ejecutó migraciones ni modificó la base de datos de producción en Supabase Cloud.
   * La verificación de permisos CLS y RLS se certificó localmente mediante la suite `test_supabase_migration.py` en Docker (16 tests pasando).
   * La aplicación de cualquier ajuste de permisos a nivel de columna en la consola de Supabase Cloud requerirá la autorización y ejecución por parte del propietario del proyecto.
2. **Activación del Piloto de Estudiantes (Gate G-07):**
   * La plataforma se encuentra técnicamente estabilizada y certificada.
   * La decisión comercial, operativa y formal de abrir el acceso a los primeros estudiantes piloto corresponde exclusivamente al propietario de Qurio.

---

## 10. Conclusión y Recomendación Operativa

La Fase 10 de Qurio ha sido **revisada, corregida, optimizada y formalmente certificada**.

El proyecto cumple al 100% con los criterios de seguridad curricular (`C-01`), persistencia autoritativa (`C-02`), resiliencia de migración (`D-05`), integridad de progreso (`C-03`), esquema canónico (`C-04`), navegación web con preservación de borrador (`C-05`) y optimización de bundle de producción (reducción del 64%).

La rama [`feat/phase-10-stabilization`](https://github.com/ErickKNT/qurio/tree/feat/phase-10-stabilization) se encuentra lista, limpia y documentada para su revisión ejecutiva previa a la decisión del piloto.
