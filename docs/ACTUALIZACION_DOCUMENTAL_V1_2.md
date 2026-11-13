# Qurio — Reporte de Revisión Final de Consistencia Técnica Documental v1.2

| Metadato | Detalle |
| :--- | :--- |
| **Fecha de entrega** | 10 de noviembre de 2026 |
| **Versión entregada** | **v1.2** |
| **Documentos actualizados** | 1. [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`](../product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md)<br>2. [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) |
| **Registro de Bitácora** | [`docs/BITACORA.md`](../BITACORA.md) (Entrada 22) |
| **Carácter de la tarea** | **Estrictamente documental** (cero cambios en código de frontend, backend, SQL, base de datos o infraestructura) |
| **Autoría** | Equipo Multidisciplinario de Arquitectura de Software, Seguridad de Aplicaciones, QA y UX Engineering |

---

## 1. Confirmación Explícita de Restricciones y Reglas de Gobernanza

* **CERO modificación de código de aplicación:** No se modificaron archivos en `apps/web/` ni en `apps/api/`.
* **CERO modificación de bases de datos o infraestructura:** No se modificaron esquemas en `database/`, no se ejecutaron migraciones, no se tocó Supabase Cloud ni se alteraron contenedores Docker.
* **CERO despliegues, merges ni PRs:** No se creó ninguna Pull Request, no se realizaron fusiones a `main`, no se tocó la rama `main` ni se inició la codificación de `PR-10.1`.
* **Preservación intacta de decisiones estratégicas:** Las decisiones ejecutivas **`D-01` a `D-07`** aprobadas por el propietario del producto se mantienen íntegras y plenamente respetadas.
* **Detención y espera:** La implementación técnica de la Fase 10 permanece en pausa obligatoria hasta recibir la autorización expresa del propietario del producto.

---

## 2. Resumen de las Cuatro Correcciones Técnicas Incorporadas en v1.2

### 2.1 Corrección C-03: Fuente Autoritativa del Progreso y Estados de Carga

1. **Eliminación de `ex.is_completed` como Fuente de Aprobación:**
   * En la versión anterior de `computeTracksProgress` existía la condición `if (completedSet.has(ex.id) || ex.is_completed === true)`.
   * En la versión 1.2, esta condición fue erradicada. Para usuarios autenticados, **únicamente `authoritativeCompletedIds`** (obtenido de `public.exercise_attempts` con `status = 'PASSED'` en Supabase y de los resultados devueltos por `record_verified_attempt` en la sesión) puede acreditar un ejercicio completado (`if (completedSet.has(ex.id))`).
   * La propiedad local `ex.is_completed` es estrictamente ignorada en el cálculo oficial, impidiendo que banderas en memoria del cliente o manipulaciones de DevTools adulterasen el avance.
2. **Separación Algorítmica entre Usuarios Autenticados e Invitados:**
   * Se crearon dos funciones con responsabilidades desacopladas:
     * `computeOfficialTracksProgress(tracks, exercises, authoritativeCompletedIds, options)`: Función oficial para usuarios con sesión activa.
     * `computeGuestTrialTracksProgress(tracks, exercises, guestTrialCompletedIds, options)`: Función separada y explícita para invitados, que acota rígidamente los intentos locales a los 3 ejercicios de prueba del Módulo 1 (`GUEST_TRIAL_EXERCISE_IDS`), impidiendo que IDs ajenos o progreso residual contaminen las estadísticas oficiales.
3. **Manejo Seguro del Estado `isLoading` y Representación en la Interfaz:**
   * Mientras la petición asíncrona del catálogo (`isLoadingCatalog`) o del historial de intentos (`isLoadingProgress`) esté en curso (`options.isLoading === true`), la función retorna `is_progress_loading: true`, `completed_exercises: null` y `progress_percent: null`.
   * **En la UI (`TrackCard`, `TracksView`, `DashboardView`):** Si `track.is_progress_loading === true` o `track.completed_exercises === null`, la barra de progreso muestra un efecto visual de *shimmer skeleton* (`bg-surface-container-highest animate-pulse`) y el texto de avance muestra la insignia `"Sincronizando progreso..."`. Se elimina el parpadeo de `0 / 22 (0%)` transitorio que confundía al estudiante.

---

### 2.2 Corrección D-05: Recuperación de Migraciones Interrumpidas e Idempotencia

1. **Esquema Enriquecido de `qurio_guest_progress_v1`:**
   * Cada registro local almacena: `exercise_id`, `submitted_sql`, `hints_used`, `passed_at`, `sync_status` (`'pending' | 'syncing'`), `sync_started_at` (marca de tiempo ISO) y `session_instance_id` (identificador de la pestaña/instancia que tomó el candado).
2. **Recuperación de Candados Obsoletos (*Stale Locks*):**
   * Si la aplicación fue cerrada, recargada con `F5` o sufrió una pérdida de red mientras uno o más elementos estaban en `syncing`:
     * Al inicializarse la aplicación con sesión autenticada, el cliente escanea los elementos en `syncing`.
     * Si `sync_started_at` excede un umbral de 30 segundos o pertenece a una sesión previa, se inicia el protocolo de recuperación.
3. **Tratamiento de Respuestas HTTP Perdidas (Persistencia Huérfana Confirmada):**
   * Antes de descartar o re-enviar un elemento que quedó colgado en `syncing`, el cliente consulta la fuente autoritativa en Supabase: `GET /rest/v1/exercise_attempts?user_id=eq.{user_id}&exercise_id=eq.{exercise_id}&status=eq.PASSED&select=id`.
   * **Caso A (Persistido en el servidor antes del corte):** Si el intento ya existe en Supabase con `PASSED`, la persistencia remota está confirmada. El cliente retira el elemento de `localStorage` de inmediato sin re-ejecutar peticiones innecesarias.
   * **Caso B (No persistido en el servidor):** El cliente restaura de forma segura el elemento a `sync_status: 'pending'`, limpiando `sync_started_at` para permitir un reintento limpio.
4. **Prevención de Sincronizaciones Paralelas:**
   * Se implementa un candado en memoria a nivel de clave compuesta `${user_id}:${exercise_id}`. Llamadas concurrentes (ej. re-renders de React, múltiples pestañas o eventos repetidos de `onAuthStateChange`) son descartadas si ya existe una sincronización en vuelo para ese ejercicio y usuario.
5. **Reintentos Idempotentes:**
   * Cuando se re-envía una consulta mediante `POST /api/v1/exercises/{exercise_id}/submit`, la RPC `record_verified_attempt` (con bloqueo pesimista `SELECT ... FOR UPDATE` e índice único parcial `idx_single_awarded_passed_attempt`) devuelve `{ "already_passed": true, "xp_awarded": 0, "total_xp": ..., "level": ... }`. El cliente reconoce esto como confirmación remota exitosa y limpia el elemento local.
6. **Limpieza Exclusiva tras Confirmación Remota:**
   * Jamás se elimina un elemento de `localStorage` de forma optimista. Se limpia únicamente tras recibir confirmación remota del backend o verificar su existencia previa en la base de datos.
7. **Cero Garantías de Latencia no Verificadas:**
   * Se eliminó cualquier promesa infundada de sincronización en menos de 100 ms. La interfaz muestra un indicador no bloqueante de sincronización en segundo plano.

---

### 2.3 Corrección C-01: Fuente Maestra Única del Currículo y Representaciones Derivadas

1. **Jerarquía Normativa del Currículo:**
   * **Única Fuente Maestra Canónica:** Se define formalmente a `EXERCISES_SEED` (junto con `TRACKS_SEED` y `MODULES_SEED`) en [`apps/api/app/modules/curriculum/seed_data.py`](../../apps/api/app/modules/curriculum/seed_data.py) como la **única fuente de verdad** del catálogo de retos en el repositorio.
   * **Representaciones Derivadas:**
     1. [`database/supabase/02_seed_curriculum.sql`](../../database/supabase/02_seed_curriculum.sql): Representación derivada generada para la base de datos de producción; contiene `solution_query` para uso exclusivo del evaluador interno.
     2. `FALLBACK_EXERCISES` en [`apps/web/src/lib/api.ts`](../../apps/web/src/lib/api.ts): Representación derivada pública para el cliente web; carece estrictamente de `solution_query` y sirve como catálogo de respaldo en memoria.
2. **Mecanismo de Sincronización:**
   * Toda modificación curricular debe nacer en `seed_data.py` y propagarse de forma sincronizada hacia `02_seed_curriculum.sql` (con solución) y `api.ts` (sin solución).
3. **Prueba Automatizada de Paridad en 7 Atributos (`T-10.1-U3`):**
   * Se especificó la prueba automatizada en `pytest` que verifica la paridad 1:1 estricta entre la fuente maestra y las representaciones derivadas sobre los 7 atributos requeridos:
     1. **IDs:** UUIDs idénticos para cada uno de los 50 ejercicios.
     2. **Títulos:** Texto idéntico de `title`.
     3. **Módulos:** Correspondencia exacta de `module_id`.
     4. **Dificultad:** Valores idénticos de `difficulty` (`EASY`, `MEDIUM`, `HARD`).
     5. **XP:** Puntos exactos de recompensa `xp_reward`.
     6. **Orden:** Mismo orden relativo y banderas (`sort_order`, `check_order`).
     7. **Metadatos públicos:** Paridad en `prompt`, `initial_code`, `hints`, `sample_data` y `wiki`.

---

## 3. Matriz de Pruebas Nuevas y Modificadas en la Fase 10 v1.2

A continuación se detalla la matriz de pruebas planificadas que fueron añadidas o modificadas en esta revisión técnica v1.2:

| ID Prueba | Categoría | Tipo de Cambio | Comportamiento Verificado | Resultado Observable Esperado | Condición Pass/Fail | Entorno | Limitaciones |
| :---: | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **T-10.1-U3** | **1. Unitaria** | **Modificada** | Paridad estricta entre la fuente maestra (`seed_data.py`) y las representaciones derivadas (`02_seed_curriculum.sql`, `api.ts`). | Los 50 ejercicios coinciden 1:1 en los **7 atributos**: IDs, títulos, módulos, dificultad, XP, orden y metadatos públicos. | **Pasa:** Coincidencia exacta en los 7 atributos para los 50 retos.<br>**Falla:** Si existe cualquier discrepancia. | Local (`pytest`). | Verifica paridad estática en archivos; no valida instancias remotas no migradas. |
| **T-10.2-U3** | **1. Unitaria** | **Nueva** | Detección de candado obsoleto y prevención de ejecuciones paralelas por `(user_id, exercise_id)` en la migración de invitados (`D-05`). | 1) Ítems con `sync_status: 'syncing'` de >30 s se restauran a `pending`.<br>2) Peticiones simultáneas idénticas solo disparan 1 petición de red. | **Pasa:** Restauración segura a `pending` y 1 solo despacho de red.<br>**Falla:** Si se permiten llamadas paralelas o el candado queda bloqueado. | Local (Vitest / TS puro). | Valida la máquina de estados local sin red real. |
| **T-10.2-I2** | **2. Integración** | **Nueva** | Recuperación ante interrupción del navegador y respuesta HTTP perdida en migración de invitados (`D-05`). | Ítem local en `syncing` con respuesta perdida, pero persistido en Supabase. Al recargar (`F5`), el cliente comprueba el estado remoto, constata que ya está `PASSED` y limpia `localStorage`. | **Pasa:** Persistencia huérfana confirmada, ítem eliminado y 0 submits repetidos.<br>**Falla:** Si se descarta sin comprobar o se re-ejecuta innecesariamente. | Local (Vitest + RTL con mock de Supabase REST). | Simula PostgREST localmente. |
| **T-10.2-I3** | **2. Integración** | **Nueva** | Sincronización parcial con fallo transitorio y reintento idempotente (`D-05`). | 3 retos: #1 y #2 responden `200 OK` (se limpian de `localStorage`), #3 recibe `503` y regresa a `pending`. En el reintento, #3 responde `already_passed: true, xp_awarded: 0` y se limpia. | **Pasa:** Conservación de pendientes, confirmación de aprobados y 0 XP duplicado.<br>**Falla:** Si se pierde el ítem o se duplica XP. | Local (Vitest con mock de FastAPI y Supabase). | Prueba resiliencia ante errores transitorios de red. |
| **T-10.3-U1** | **1. Unitaria** | **Modificada** | Aislamiento entre rutas basado exclusivamente en `authoritativeCompletedIds`. | 3 rutas con retos distribuidos y 5 IDs completados de Ruta 1 devuelven `5/22`, `0/18` y `0/10`. La propiedad `ex.is_completed` es completamente ignorada. | **Pasa:** `completed_exercises` es `[5, 0, 0]`.<br>**Falla:** Si otra ruta sube o si `ex.is_completed` altera el cómputo. | Local (Vitest / TS puro). | Valida lógica pura en memoria. |
| **T-10.3-U2** | **1. Unitaria** | **Modificada** | Manejo de duplicados, ejercicios inactivos, rutas vacías y estado `isLoading: true`. | Con `isLoading: true`, devuelve `is_progress_loading: true`, `completed_exercises: null` y `progress_percent: null`. En estado cargado, devuelve enteros válidos sin `NaN`. | **Pasa:** Retorno de `null` en carga y enteros correctos al finalizar.<br>**Falla:** Si emite `0` o `0%` transitorio durante la carga. | Local (Vitest / TS puro). | No evalúa la red a Supabase. |
| **T-10.3-U4** | **1. Unitaria** | **Nueva** | Separación total entre progreso oficial autenticado y progreso de invitado (`computeGuestTrialTracksProgress`). | La función de invitado solo admite los 3 retos autorizados de M01. Si se le pasa el ID de un reto avanzado (M07), este es filtrado y el progreso permanece en 0. | **Pasa:** Solo los 3 retos autorizados de prueba son computables.<br>**Falla:** Si un ID ajeno suma al progreso de invitado. | Local (Vitest / TS puro). | Valida aislamiento algorítmico. |
| **T-10.3-I1** | **2. Integración** | **Modificada** | Inmunidad del progreso oficial ante adulteración de `localStorage` y mutación de `ex.is_completed = true` en el catálogo. | Se inyectan 8 IDs en `localStorage` y se mutan 5 ejercicios asignándoles `is_completed: true`. Cuando el usuario autenticado tiene solo 2 intentos `PASSED` en Supabase, la vista muestra estrictamente `2 / 22`. | **Pasa:** La vista muestra exactamente `2 / 22`.<br>**Falla:** Si `localStorage` o `ex.is_completed` incrementan el progreso oficial. | Local (Vitest + RTL con mock de Supabase Auth/REST). | Prueba integración de componentes React con store de sesión. |
| **T-10.3-S1** | **3. Seguridad** | **Nueva** | Prohibición absoluta de que `ex.is_completed = true` en cliente autorice avance oficial o desbloqueo de certificados. | Un script de DevTools muta en memoria todos los ejercicios a `is_completed: true`. El motor de certificación y las rutas verifican contra la función oficial y comprueban que el progreso permanece inalterado. | **Pasa:** 0% y cero certificados emitibles.<br>**Falla:** Si la mutación cliente autoriza la ruta. | Local (Vitest / TS puro). | Verifica integridad ante ataques desde la consola del navegador. |
| **T-10.3-B1** | **4. Navegador / UX** | **Modificada** | Renderizado del skeleton de carga durante `isLoading` y coherencia matemática en UI. | Durante la carga asíncrona, `TrackCard` muestra el skeleton `"Sincronizando progreso..."` sin parpadear `0%`, transicionando suavemente al valor real al completarse. | **Pasa:** Visualización del skeleton en carga y 0 parpadeos de 0% falso.<br>**Falla:** Si parpadea `0%` o re-ejecutar infla contadores. | Navegador real / Playwright. | Requiere flujo interactivo. |

---

## 4. Estado de Git Antes y Después

### 4.1 Estado de Git Antes de Iniciar la Tarea
```
On branch docs/product-business-blueprint-v1
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   docs/BITACORA.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	docs/ACTUALIZACION_DOCUMENTAL_V1_1.md
	docs/product/
	docs/roadmap/

no changes added to commit (use "git add" and/or "git commit -a")
```

### 4.2 Estado de Git Después de Concluir la Tarea
```
On branch docs/product-business-blueprint-v1
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   docs/BITACORA.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	docs/ACTUALIZACION_DOCUMENTAL_V1_1.md
	docs/ACTUALIZACION_DOCUMENTAL_V1_2.md
	docs/product/
	docs/roadmap/

no changes added to commit (use "git add" and/or "git commit -a")
```

### 4.3 Diferenciación Rigurosa entre Cambios Previos y Cambios de esta Tarea
1. **Cambios que ya existían antes de esta tarea:**
   * La rama activa `docs/product-business-blueprint-v1`.
   * La modificación previa en `docs/BITACORA.md` (Entradas de Fase 10 iniciales).
   * La existencia del reporte preliminar `docs/ACTUALIZACION_DOCUMENTAL_V1_1.md`.
   * Los directorios `docs/product/` y `docs/roadmap/` no estaban aún agregados al índice git (`untracked`) en esta rama de trabajo.
2. **Cambios introducidos exclusivamente durante esta tarea:**
   * Modificación de [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`](../product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md) elevándolo a la versión **1.2**.
   * Modificación de [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) elevándolo a la versión **1.2**.
   * Actualización de [`docs/BITACORA.md`](../BITACORA.md) registrando la Entrada 22 (versión 1.2).
   * Creación de este documento consolidado `docs/ACTUALIZACION_DOCUMENTAL_V1_2.md`.
   * **Cero archivos de código, SQL, migraciones o infraestructura modificados.**

---

## 5. Diffs Completos Unificados (v1.2 frente a v1.1)

### 5.1 Diff Completo de `QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` (v1.2 vs. v1.1)

```diff
diff --git a/docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md b/docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md
index ab7dc9b..3b54eef 100644
--- a/docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md
+++ b/docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md
@@ -3,12 +3,12 @@
 | Metadato | Detalle |
 | :--- | :--- |
 | **Documento** | `docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` |
-| **Versión** | `1.1` |
+| **Versión** | `1.2` |
 | **Fecha de actualización** | `10 de noviembre de 2026` |
 | **Estado de Decisiones (`D-01` a `D-07`)** | **Aprobadas por el propietario del producto** |
 | **Estado del Documento** | **Propuesta estratégica y arquitectónica documentada — Validación final del documento completo pendiente** |
 | **Repositorio de referencia** | [`https://github.com/ErickKNT/qurio`](https://github.com/ErickKNT/qurio) |
-| **Plan técnico vinculado** | [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) (v1.1) |
+| **Plan técnico vinculado** | [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) (v1.2) |
 | **Autoría del análisis** | Equipo Multidisciplinario de Producto, Diseño Instruccional, Arquitectura de Software, Seguridad de Aplicaciones, QA, Monetización SaaS y Estrategia Comercial |
 | **Audiencia objetivo** | Product Owner, Product Management, Ingeniería de Software (Frontend/Backend/Infra), Diseño UX/UI, Diseño Curricular y Operaciones Comerciales |
 
@@ -16,11 +16,11 @@
 
 ## Alcance y Estado de Gobernanza del Documento
 
-Este **Product & Business Blueprint v1.1** constituye el documento de referencia estratégica, funcional, pedagógica, arquitectónica y comercial de **Qurio**. Su propósito es guiar la evolución de Qurio desde su estado actual —un MVP técnico funcional de aprendizaje interactivo de SQL con 50 retos verificados, evaluación semántica en PostgreSQL 16 y seguridad endurecida en Supabase— hacia una **plataforma EdTech SaaS sostenible en español especializada en SQL, Python y Análisis de Datos** para México y Latinoamérica.
+Este **Product & Business Blueprint v1.2** constituye el documento de referencia estratégica, funcional, pedagógica, arquitectónica y comercial de **Qurio**. Su propósito es guiar la evolución de Qurio desde su estado actual —un MVP técnico funcional de aprendizaje interactivo de SQL con 50 retos verificados, evaluación semántica en PostgreSQL 16 y seguridad endurecida en Supabase— hacia una **plataforma EdTech SaaS sostenible en español especializada en SQL, Python y Análisis de Datos** para México y Latinoamérica.
 
 Para total claridad de gobernanza, este documento distingue explícitamente tres niveles de estado:
 
-1. **Decisiones `D-01` a `D-07` aprobadas por el propietario del producto:** Las siete definiciones puntuales sobre el corte inicial `Free`/`Plus` por IDs estables (`D-01`), jerarquía de eslóganes (`D-02`), evaluación de Stripe México sin integración aún (`D-03`), diseño independiente del motor de ejecución Python (`D-04`), modo invitado de 3 ejercicios con migración verificada (`D-05`), aplazamiento de precios académicos de `Qurio Teams` (`D-06`) y priorización bloqueante de `C-01` a `C-05` en la Fase 10 (`D-07`) cuentan con aprobación del propietario del producto.
+1. **Decisiones `D-01` a `D-07` aprobadas por el propietario del producto:** Las siete definiciones puntuales sobre el corte inicial `Free`/`Plus` por IDs estables (`D-01`), jerarquía de eslóganes (`D-02`), evaluación de Stripe México sin integración aún (`D-03`), diseño independiente del motor de ejecución Python (`D-04`), modo invitado de 3 ejercicios con migración verificada e idempotente (`D-05`), aplazamiento de precios académicos de `Qurio Teams` (`D-06`) y priorización bloqueante de `C-01` a `C-05` en la Fase 10 (`D-07`) cuentan con aprobación del propietario del producto.
 2. **Propuesta estratégica, curricular y arquitectónica documentada:** El resto del documento —incluyendo el diseño detallado de las 5 rutas, el modelo de dominio $M_k$, la estrategia Go-To-Market, la estructura de entidades SaaS y los escenarios financieros— constituye una **propuesta estratégica documentada** que sirve como marco de planificación.
 3. **Validación final del documento completo y del producto pendiente:** La aceptación de las decisiones `D-01` a `D-07` **no equivale a declarar que el producto completo, sus precios o su arquitectura futura están cerrados o aprobados en su totalidad**. La validación integral del documento completo y la adopción definitiva de cada etapa posterior (como la elección final de la arquitectura del runner de Python o los precios comerciales tras pruebas reales) permanecen sujetas a revisión y aprobación explícita antes de su implementación.
 
@@ -35,7 +35,8 @@ Para total claridad de gobernanza, este documento distingue explícitamente tres
 | Versión | Fecha | Autor / Rol | Descripción del Cambio |
 | :---: | :---: | :--- | :--- |
 | **1.0** | `2026-11-09` | Equipo Multidisciplinario (PM, Product Design, Software Architect, Monetization, Curriculum, Business Strategy) | Elaboración inicial del *Product & Business Blueprint* integral de Qurio. Incluye auditoría de código real contra visión comercial, análisis de 5 segmentos de mercado, modelo freemium (*Free*, *Plus*, *Teams*), arquitectura curricular de 5 rutas, sistema de dominio de competencias, estrategia Go-To-Market (México/LATAM), roadmap de 12 meses, arquitectura de *entitlements* y pagos, y modelado de *Unit Economics*. |
-| **1.1** | `2026-11-10` | Equipo Multidisciplinario (PM, Software Architecture, AppSec, QA, UX Engineering) | Incorporación de las decisiones aprobadas **D-01 a D-07** y refinamiento técnico de seguridad y arquitectura: (1) Precisión en `C-01` sobre revocación del permiso `SELECT` general de tabla en PostgreSQL/Supabase y concesión explícita por columna, encapsulamiento de `service_role` en backend, sincronización de fallback con fuente canónica y pruebas integrales anti-filtración; (2) Clarificación en `D-04` de la separación de responsabilidades entre FastAPI (validación, evaluación, persistencia e invocación de RPC) y el worker aislado de Python (ejecución pura sin credenciales de Supabase ni permisos sobre datos de usuarios), manteniendo contenedores efímeros, Pyodide/WASM e híbrido como alternativas por evaluar sin seleccionar ni implementar aún una solución definitiva; (3) Mecanismo de migración de invitados (`D-05`) seguro, idempotente, con soporte de sincronización parcial, conservación de pendientes ante errores, limpieza local solo tras confirmación remota exitosa y sin garantías de latencia no verificadas; (4) Sustitución de rutas absolutas locales por rutas relativas al repositorio y distinción explícita en el encabezado entre decisiones `D-01`–`D-07` aprobadas, propuesta estratégica documentada y validación final pendiente. Vinculado con [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) v1.1. |
+| **1.1** | `2026-11-10` | Equipo Multidisciplinario (PM, Software Architecture, AppSec, QA, UX Engineering) | Incorporación de las decisiones aprobadas **D-01 a D-07** y refinamiento técnico de seguridad y arquitectura: (1) Precisión en `C-01` sobre revocación del permiso `SELECT` general de tabla en PostgreSQL/Supabase y concesión explícita por columna, encapsulamiento de `service_role` en backend, sincronización de fallback con fuente canónica y pruebas integrales anti-filtración; (2) Clarificación en `D-04` de la separación de responsabilidades entre FastAPI (validación, evaluación, persistencia e invocación de RPC) y el worker aislado de Python (ejecución pura sin credenciales de Supabase ni permisos sobre datos de usuarios), manteniendo alternativas abiertas a evaluación formal; (3) Mecanismo de migración de invitados (`D-05`) seguro, idempotente, con soporte de sincronización parcial, conservación de pendientes ante errores y sin garantías de latencia no verificadas; (4) Sustitución de rutas absolutas por relativas y delimitación de gobernanza. |
+| **1.2** | `2026-11-10` | Equipo Multidisciplinario (PM, Software Architecture, AppSec, QA, UX Engineering) | **Revisión final de consistencia técnica documental v1.2:**<br>1) **`C-01` (Fuente Maestra del Currículo):** Identificación formal de `EXERCISES_SEED` en `seed_data.py` como la **única fuente maestra** del currículo y definición de `02_seed_curriculum.sql` (seed DB con `solution_query`) y `FALLBACK_EXERCISES` en `api.ts` (catálogo cliente sin `solution_query`) como **representaciones derivadas**, estableciendo el mecanismo de sincronización y prueba de paridad en 7 atributos (IDs, Títulos, Módulos, Dificultad, XP, Orden y Metadatos públicos).<br>2) **`C-03` (Fuente Autoritativa de Progreso y Estados de Carga):** Establecimiento estricto de que para usuarios autenticados únicamente `authoritativeCompletedIds` determina los ejercicios completados (eliminando `ex.is_completed` como vía alterna), separación lógica explícita para progreso temporal de invitados (`computeGuestTrialTracksProgress`) y representación del estado `isLoading` mediante skeleton visual (`is_progress_loading: true`, `completed_exercises: null`) para evitar porcentajes transitorios falsos.<br>3) **`D-05` (Recuperación de Migraciones Interrumpidas):** Protocolo robusto para elementos en `syncing` tras interrupción/cierre del navegador, restauración segura a `pending`, reintentos idempotentes, tratamiento de respuestas HTTP perdidas mediante verificación del estado remoto (`PASSED` en Supabase) antes de descartar o reintentar, limpieza local exclusivamente tras persistencia confirmada, prevención de sincronizaciones paralelas para el mismo `(user_id, exercise_id)` y especificación de pruebas unitarias y de integración. |
 
 ---
 
@@ -132,9 +133,9 @@ La auditoría técnica reveló **9 contradicciones o brechas críticas** entre l
 
 | # | Área | Estado Normativo | Contradicción / Hallazgo Detectado | Impacto en el Producto y Negocio | Plan de Acción Aprobado |
 | :-: | :--- | :---: | :--- | :--- | :--- | :--- |
-| **C-01** | **Seguridad Curricular (`solution_query` expuesta)** | **Prioridad Bloqueante Fase 10 (`D-07`)** | El documento [`docs/SAD.md`](../SAD.md) afirma que `GET /api/v1/exercises/{id}` devuelve el reto *"sin exponer la query de solución"*. Sin embargo, en [`seed_data.py`](../../apps/api/app/modules/curriculum/seed_data.py), [`repository.py`](../../apps/api/app/modules/curriculum/repository.py), [`router.py`](../../apps/api/app/modules/runner/router.py), [`api.ts`](../../apps/web/src/lib/api.ts) y la configuración de privilegios de [`01_schema.sql`](../../database/supabase/01_schema.sql), **`solution_query` se envía íntegra al navegador**, puede consultarse vía PostgREST y está embebida en el bundle JS (`FALLBACK_EXERCISES`). | Un usuario con DevTools abierto puede leer `solution_query` en la pestaña Network, mediante consulta directa a PostgREST o en el bundle estático, copiando la respuesta para ganar XP o aprobar evaluaciones/certificados. | Separar `ExercisePublicDTO` (sin `solution_query`) de `ExerciseInternal` (exclusivo en backend); revocar el permiso `SELECT` general de tabla en `public.exercises` y conceder `SELECT` explícito solo sobre las columnas públicas necesarias; encapsular `service_role` exclusivamente en el backend; sincronizar el fallback con la fuente canónica sin `solution_query` en cliente e incorporar pruebas de endpoints, bundles, respuestas API y permisos DB. Ver [Sección 2.3](#23-especificación-de-seguridad-para-la-protección-de-soluciones-c-01) y [`PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md). |
+| **C-01** | **Seguridad Curricular (`solution_query` expuesta)** | **Prioridad Bloqueante Fase 10 (`D-07`)** | El documento [`docs/SAD.md`](../SAD.md) afirma que `GET /api/v1/exercises/{id}` devuelve el reto *"sin exponer la query de solución"*. Sin embargo, en [`seed_data.py`](../../apps/api/app/modules/curriculum/seed_data.py), [`repository.py`](../../apps/api/app/modules/curriculum/repository.py), [`router.py`](../../apps/api/app/modules/runner/router.py), [`api.ts`](../../apps/web/src/lib/api.ts) y la configuración de privilegios de [`01_schema.sql`](../../database/supabase/01_schema.sql), **`solution_query` se envía íntegra al navegador**, puede consultarse vía PostgREST y está embebida en el bundle JS (`FALLBACK_EXERCISES`). | Un usuario con DevTools abierto puede leer `solution_query` en la pestaña Network, mediante consulta directa a PostgREST o en el bundle estático, copiando la respuesta para ganar XP o aprobar evaluaciones/certificados. | Separar `ExercisePublicDTO` (sin `solution_query`) de `ExerciseInternal` (exclusivo en backend); revocar el permiso `SELECT` general de tabla en `public.exercises` y conceder `SELECT` explícito solo sobre las columnas públicas necesarias; encapsular `service_role` exclusivamente en el backend; definir `EXERCISES_SEED` (`seed_data.py`) como la única fuente maestra del currículo y a `02_seed_curriculum.sql` y `FALLBACK_EXERCISES` (`api.ts`) como representaciones derivadas, con prueba automatizada de paridad en 7 atributos (IDs, títulos, módulos, dificultad, XP, orden y metadatos públicos), e incorporar pruebas anti-filtración en endpoints, bundles y permisos DB. Ver [Sección 2.3](#23-especificación-de-seguridad-para-la-protección-de-soluciones-c-01) y [`PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md). |
 | **C-02** | **Doble escritura residual en Frontend (`persistence.ts`)** | **Prioridad Bloqueante Fase 10 (`D-07`)** | Tras aplicar [`03_security_hardening.sql`](../../database/supabase/03_security_hardening.sql), el backend certifica el intento vía RPC `record_verified_attempt`. No obstante, [`apps/web/src/lib/persistence.ts`](../../apps/web/src/lib/persistence.ts) e invocaciones en [`App.tsx`](../../apps/web/src/App.tsx) y [`useAuth.tsx`](../../apps/web/src/hooks/useAuth.tsx) aún intentan ejecutar `.from('exercise_attempts').insert(...)`, `.from('user_profiles').update({ xp, level, username, current_streak_days })` y `.from('user_daily_activity').insert/update(...)` desde el navegador, las cuales son rechazadas por PostgreSQL (`42501 permission denied`) y silenciadas con `console.warn`. | Genera escrituras directas no autorizadas (`403/42501`) hacia Supabase desde el cliente, bloquea actualizaciones legítimas de perfil al mezclar columnas revocadas y desincroniza `user_daily_activity`. | Consolidar al backend como única fuente autoritativa del progreso oficial de usuarios autenticados; eliminar toda escritura directa de intentos, XP, nivel o actividad oficial desde el frontend; restringir `updateProfile` del cliente a campos visuales (`display_name`, `avatar_url`, `bio`); propagar en `EvaluationResponse` los datos autoritativos devueltos por `record_verified_attempt` sin modificar la RPC existente. Ver [`PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md). |
-| **C-03** | **Cálculo de progreso de rutas en `App.tsx`** | **Prioridad Fase 10 (`D-07`)** | En [`App.tsx`](../../apps/web/src/App.tsx), al cargar o aprobar un ejercicio se asigna `completed_exercises: completedIds.length` (el total global) e incrementa `+1` a **todas** las rutas (`tracks.map`), sin filtrar por ruta ni verificar si el ejercicio ya estaba completado previamente. | Muestra el mismo contador erróneo de ejercicios completados en las 3 rutas dentro de la vista `/tracks` e infla el contador al re-ejecutar ejercicios ya aprobados. | Calcular `completed_exercises` y `total_exercises` de forma pura y determinista filtrando ejercicios activos y excluidos, deduplicando IDs, manejando rutas vacías y estados de carga parcial/inicial, y usando la fuente autorizada para usuarios autenticados. Ver [`PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md). |
+| **C-03** | **Cálculo de progreso de rutas en `App.tsx`** | **Prioridad Fase 10 (`D-07`)** | En [`App.tsx`](../../apps/web/src/App.tsx), al cargar o aprobar un ejercicio se asigna `completed_exercises: completedIds.length` (el total global) e incrementa `+1` a **todas** las rutas (`tracks.map`), sin filtrar por ruta ni verificar si el ejercicio ya estaba completado previamente. | Muestra el mismo contador erróneo de ejercicios completados en las 3 rutas dentro de la vista `/tracks` e infla el contador al re-ejecutar ejercicios ya aprobados. | Establecer que para usuarios autenticados únicamente `authoritativeCompletedIds` determina el progreso oficial (eliminando `ex.is_completed` o `localStorage` como fuentes de aprobación); separar la lógica para progreso temporal de invitados; filtrar ejercicios activos y no excluidos; y representar el estado `isLoading` mediante skeleton visual (`is_progress_loading: true`, `completed_exercises: null`) para no presentar porcentajes definitivos falsos. Ver [`PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md). |
 | **C-04** | **Inconsistencia en el nombre de la 10.ª tabla y conteos del Sandbox** | **Prioridad Fase 10 (`D-07`)** | En [`README.md`](../../README.md) y [`CURRICULUM_SPEC.md`](../CURRICULUM_SPEC.md) se menciona la tabla `metodos_pago`, mientras que en [`database/sandbox/ecommerce_seed.sql`](../../database/sandbox/ecommerce_seed.sql) la tabla física creada en PostgreSQL se llama `pagos` (con columna `metodo_pago`). Además, existen discrepancias de `rowCount` en [`api.ts`](../../apps/web/src/lib/api.ts) y [`ExerciseSpecPanel.tsx`](../../apps/web/src/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel.tsx) solo muestra 4 de las 10 tablas. | Confunde a los usuarios que exploran el esquema en el IDE o Playground frente a la documentación escrita y tablas de ejemplo. | Definir [`database/sandbox/ecommerce_seed.sql`](../../database/sandbox/ecommerce_seed.sql) (tabla `pagos` y columna `metodo_pago`) como fuente canónica sin modificar el esquema físico ni los datos seed; sincronizar documentación, nombres de tablas, columnas, conteos y componentes visuales, e incorporar pruebas automatizadas contra divergencias. Ver [`PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md). |
 | **C-05** | **Enrutamiento en memoria sin URLs reales** | **Prioridad Bloqueante Fase 10 (`D-07`)** | El enrutamiento en [`App.tsx`](../../apps/web/src/App.tsx) utiliza estado local en memoria (`useState<AppPath>('dashboard')`) sin sincronizar `window.location.pathname`. Recargar la página pierde la vista actual, el botón Atrás/Adelante del navegador no navega entre vistas y escribir una URL inexistente carga el Dashboard en vez de `NotFoundView`. | Impide enlaces profundos (*deep linking* compartibles como `/tracks/sql-foundations` o `/exercises/:id`), retornos de pasarela de pago y verificación pública de certificados. | Implementar enrutamiento web real preservando todos los formatos reales de autenticación de Supabase, esperando la carga del catálogo antes de declarar un 404 en `/exercises/:exerciseId`, especificando el fallback SPA de hosting y probando con `history.pushState` / `popstate`. Ver [`PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md). |
 | **C-06** | **Ausencia de control de acceso por plan (*Entitlements*)** | **Planificado Post-Fase 10 (`D-01`)** | Actualmente el 100% de los 50 ejercicios, pistas y el Playground son públicos y gratuitos incluso para usuarios invitados (`get_optional_current_user`). No existen tablas de planes, suscripciones ni validación de permisos Premium en backend. | No es posible monetizar contenido avanzado ni limitar cuotas de ejecución diferenciadas por plan (*Free* vs *Plus*). | Implementar el motor de *Entitlements* en backend y base de datos mediante identificadores estables de ejercicio (`access_tier`), conforme a la decisión `D-01` ([Sección 4.5](#45-reglas-de-autorización-free-vs-plus-y-evolución-del-catálogo-sin-pérdida-de-progreso-decisión-aprobada-d-01) y [Sección 9](#9-arquitectura-técnica-actual-y-evolución-saas)). |
@@ -160,10 +161,23 @@ Dado el carácter crítico de `C-01` para la integridad académica y comercial d
 3. **Encapsulamiento Estricto del Cliente con `service_role`:**
    * La credencial privilegiada `SUPABASE_SERVICE_ROLE_KEY` y el cliente/adaptador que la utiliza para leer `solution_query` o invocar RPCs administrativas deben estar **100% encapsulados en el backend FastAPI** ([`apps/api/app/core/supabase.py`](../../apps/api/app/core/supabase.py) y [`apps/api/app/modules/curriculum/repository.py`](../../apps/api/app/modules/curriculum/repository.py)).
    * Está terminantemente prohibido exponer `SUPABASE_SERVICE_ROLE_KEY` al navegador, incluirla en variables de entorno con prefijo `VITE_*`, imprimirla en logs de aplicación o empaquetarla en los bundles del frontend.
-4. **Sincronización del Fallback en Memoria con la Fuente Canónica de Ejercicios:**
-   * **Fuente canónica del currículo:** La definición maestra de los 50 ejercicios reside en [`apps/api/app/modules/curriculum/seed_data.py`](../../apps/api/app/modules/curriculum/seed_data.py) (`EXERCISES_SEED`) en paridad exacta con [`database/supabase/02_seed_curriculum.sql`](../../database/supabase/02_seed_curriculum.sql).
-   * **Fallback en memoria del Backend:** Cuando el repositorio del backend opera en modo fallback local (por ejemplo, en desarrollo sin conexión a Supabase), los métodos públicos (`list_public_exercises`, `get_public_by_id`) transforman cada instancia de `EXERCISES_SEED` a `ExercisePublicDTO` (excluyendo `solution_query`), mientras que solo el método privado `get_internal_for_evaluation` conserva acceso a `ExerciseInternal.solution_query`.
-   * **Fallback en memoria del Frontend:** El catálogo de respaldo del cliente (`FALLBACK_EXERCISES` en [`apps/web/src/lib/api.ts`](../../apps/web/src/lib/api.ts)) se deriva exclusivamente de la proyección pública (`ExercisePublicDTO` sin `solution_query`). La sincronización entre la fuente canónica (`seed_data.py` / `02_seed_curriculum.sql`) y el fallback público del frontend (`api.ts`) se garantiza mediante pruebas automatizadas en la suite de `pytest` que verifican la igualdad exacta de los 50 UUIDs, `module_id`, `title`, `difficulty`, `xp_reward`, `check_order` y `sort_order`, al tiempo que comprueban la ausencia total de `solution_query` en `apps/web/`.
+4. **Fuente Maestra Única del Currículo y Representaciones Derivadas:**
+   * **Fuente Maestra Canónica Única:** Se establece formalmente a `EXERCISES_SEED` (junto con `TRACKS_SEED` y `MODULES_SEED`) en [`apps/api/app/modules/curriculum/seed_data.py`](../../apps/api/app/modules/curriculum/seed_data.py) como la **única fuente maestra canónica de verdad** de todo el currículo en el repositorio.
+   * **Representaciones Derivadas:**
+     1. [`database/supabase/02_seed_curriculum.sql`](../../database/supabase/02_seed_curriculum.sql): Representación derivada para el sembrado inicial y migraciones en PostgreSQL/Supabase, generada a partir de la fuente maestra, que incluye `solution_query` para que la base de datos de backend contenga las soluciones oficiales.
+     2. `FALLBACK_EXERCISES` en [`apps/web/src/lib/api.ts`](../../apps/web/src/lib/api.ts): Representación derivada pública para el cliente web, sin `solution_query`, utilizada como fallback en memoria en caso de contingencia de red.
+   * **Mecanismo de Sincronización y Prueba Automatizada de Paridad en 7 Atributos:**
+     * Cualquier modificación, adición o corrección al currículo debe realizarse en la fuente maestra `seed_data.py` y propagarse de forma sincronizada hacia sus representaciones derivadas.
+     * Se establece una prueba automatizada en `pytest` (`T-10.1-U3`) que verifica la paridad exacta entre la fuente maestra y las representaciones derivadas en los siguientes **7 atributos requeridos**:
+       1. **IDs:** UUIDs idénticos para cada uno de los 50 ejercicios.
+       2. **Títulos:** Texto idéntico en `title`.
+       3. **Módulos:** Correspondencia exacta de `module_id`.
+       4. **Dificultad:** Valores idénticos de `difficulty` (`EASY`, `MEDIUM`, `HARD`).
+       5. **XP:** Puntos exactos de recompensa `xp_reward`.
+       6. **Orden:** Mismo orden relativo y flags (`sort_order`, `check_order`).
+       7. **Metadatos públicos:** Paridad en `prompt`, `initial_code`, `hints`, `sample_data` y `wiki`.
+   * **Fallback en memoria del Backend:** Cuando el repositorio del backend opera en modo fallback local (sin conexión a Supabase), los métodos públicos (`list_public_exercises`, `get_public_by_id`) transforman cada instancia de `EXERCISES_SEED` a `ExercisePublicDTO` (excluyendo `solution_query`), mientras que solo el método privado `get_internal_for_evaluation` conserva acceso a `ExerciseInternal.solution_query`.
+   * **Fallback en memoria del Frontend:** `FALLBACK_EXERCISES` se deriva exclusivamente de la proyección pública (`ExercisePublicDTO` sin `solution_query`). La prueba de seguridad confirma la ausencia total de la clave `solution_query` en todo `apps/web/`.
 5. **Requisitos de Pruebas Anti-Filtración:**
    * La verificación de `C-01` exige pruebas automatizadas que comprueben que `solution_query` no se filtra a través de:
      1. **Endpoints y respuestas API:** `GET /api/v1/exercises`, `GET /api/v1/exercises/{id}` y `POST /api/v1/exercises/{id}/submit`.
@@ -732,20 +746,52 @@ flowchart LR
 
 #### 3. Mecanismo de Migración Seguro, Resiliente e Idempotente al Registrarse
 * **Prohibición de confiar en saldos de XP o banderas del `localStorage`:** Al registrarse, el servidor **nunca acepta** un payload del tipo `{"claim_xp": 45, "completed_ids": [...]}` enviado por el navegador, ya que sería falsificable desde DevTools.
-* **Protocolo de Migración por Re-Verificación Autoritativa e Idempotente (*Replay, Verify & Confirm per Item*):**
+* **Estructura Enriquecida del Estado Local (`qurio_guest_progress_v1`):**
+  Para gobernar el ciclo de vida y la recuperación ante fallos o interrupciones, cada registro incluye:
+  ```typescript
+  interface GuestProgressItem {
+    exercise_id: string;
+    submitted_sql: string;
+    hints_used: number;
+    passed_at: string;
+    sync_status: 'pending' | 'syncing';
+    sync_started_at?: string; // Timestamp ISO para detección de candados huérfanos (stale locks)
+    session_instance_id?: string; // Identificador de la pestaña/instancia que tomó el candado
+  }
+  ```
+* **Protocolo de Migración por Re-Verificación Autoritativa, Recuperación de Interrupciones e Idempotencia:**
   1. **Conservación durante el flujo de registro:** Los datos almacenados en `qurio_guest_progress_v1` se conservan intactos en `localStorage` durante todo el proceso de `signUp`, redirección de confirmación de correo (`/auth/confirm`) e inicio de sesión (`signIn`).
-  2. **Detección e inicio de sincronización:** Cuando el cliente detecta una sesión autenticada válida (`session.access_token` presente) y existen elementos en `qurio_guest_progress_v1`, inicia el proceso de migración asíncrona procesando únicamente los elementos con `sync_status === 'pending'`.
-  3. **Prevención de duplicaciones ante reintentos (Idempotencia en Cliente y Servidor):**
-     * **En el cliente:** Se aplica un candado en memoria (`isSyncingGuestProgress`) y se marca cada elemento en vuelo como `sync_status: 'syncing'` para evitar que re-renderizados de React o eventos múltiples de `onAuthStateChange` disparen peticiones paralelas duplicadas.
-     * **En el backend y base de datos:** Cada elemento se envía al endpoint autenticado `POST /api/v1/exercises/{exercise_id}/submit` con `{ query: submitted_sql, hints_used }`. Si una petición se reintenta (por ejemplo, si la primera sí llegó a la base de datos pero la respuesta HTTP se cortó), la RPC `public.record_verified_attempt` con bloqueo `SELECT ... FOR UPDATE` y el índice único parcial `idx_single_awarded_passed_attempt` en `public.exercise_attempts` garantizan a nivel transaccional que **el usuario jamás reciba XP duplicado** (`already_passed: true`, `xp_awarded: 0` en el segundo intento).
-  4. **Soporte de sincronización parcial y conservación de pendientes ante errores:**
-     * Los hasta 3 ejercicios se sincronizan y confirman de forma individualizada.
-     * Si el ejercicio #1 y el ejercicio #2 se re-validan y persisten exitosamente en Supabase, pero el ejercicio #3 falla por un error transitorio de red, límite de tasa (`HTTP 429`) o indisponibilidad temporal del servidor (`HTTP 5xx`), **el progreso de los ejercicios #1 y #2 queda acreditado de forma permanente en la cuenta del usuario, mientras que el ejercicio #3 se revierte a `sync_status: 'pending'` y se conserva en `localStorage`** para reintentarse automáticamente en la siguiente carga o mediante acción manual del usuario.
-     * Si una consulta almacenada hubiera sido manipulada manualmente en `localStorage` y al re-evaluarse en el backend devuelve `FAILED` o `ERROR` de sintaxis, dicho elemento inválido se descarta sin otorgar XP y sin bloquear la sincronización de los demás ejercicios válidos.
-  5. **Limpieza condicional estricta tras confirmación remota:**
-     * Un elemento individual solo se elimina de `qurio_guest_progress_v1` **después de que el backend responda `HTTP 200 OK` confirmando que la evaluación fue `PASSED` y que la persistencia remota vía `record_verified_attempt` concluyó sin error**.
-     * La clave `qurio_guest_progress_v1` de `localStorage` se elimina por completo **únicamente cuando la lista de elementos pendientes queda vacía (`0` pendientes)**.
-  6. **Sin promesas de latencia no verificadas:** La duración de la migración depende de la latencia de red del usuario, la ejecución secuencial en el PostgreSQL Sandbox y la transacción RPC en Supabase Cloud; por tanto, no se establecen garantías de tiempo fijo (como $< 100\text{ ms}$) sin medición empírica previa, sino que la interfaz muestra un estado de sincronización no bloqueante hasta recibir la confirmación del servidor.
+  2. **Detección y Recuperación de Elementos Interrumpidos en `syncing`:**
+     * Si la aplicación fue cerrada abruptamente, recargada con `F5` o perdió la conexión a internet mientras uno o varios elementos estaban en estado `syncing`:
+       * Al reabrir o recargar la aplicación con sesión autenticada, el cliente escanea `qurio_guest_progress_v1`.
+       * Si encuentra elementos con `sync_status === 'syncing'` cuyo `sync_started_at` supere un umbral de seguridad (timeout de candado obsoleto de 30 segundos) o pertenezca a otra pestaña/sesión anterior:
+         * **Verificación de estado remoto previo a reintento (Tratamiento de respuesta HTTP perdida):** El cliente consulta a la fuente autoritativa en Supabase si el ejercicio ya fue registrado: `GET /rest/v1/exercise_attempts?user_id=eq.{user.id}&exercise_id=eq.{item.exercise_id}&status=eq.PASSED&select=id`.
+         * **Si ya existe en el servidor:** Significa que el backend y Supabase persistieron el intento exitosamente antes de que la conexión o ventana del navegador se interrumpiera. Por consiguiente, se considera la **persistencia remota confirmada**, se notifica a la interfaz y se limpia el elemento de `localStorage`.
+         * **Si no existe en el servidor:** Significa que la petición no llegó o fue abortada antes de la transacción. El cliente restaura de forma segura el elemento a `sync_status: 'pending'`, limpiando `sync_started_at` para permitir un reintento limpio.
+  3. **Prevención de Sincronizaciones Paralelas para el mismo Usuario y Ejercicio:**
+     * Se implementa un candado concurrente en memoria a nivel de par `${user_id}:${exercise_id}` (`activeSyncLocks.has(...)`).
+     * Si múltiples pestañas del navegador o múltiples disparadores de React (`useEffect`, `onAuthStateChange`) coinciden en el montaje, solo una instancia adquiere el candado por ejercicio; las peticiones concurrentes para el mismo `(user_id, exercise_id)` son descartadas de inmediato.
+  4. **Reintentos Idempotentes (*Replay, Verify & Confirm*):**
+     * Cada elemento en `pending` se envía al endpoint autenticado `POST /api/v1/exercises/{exercise_id}/submit` con `{ query: submitted_sql, hints_used }`.
+     * Si por un reintento de red la petición ya había sido procesada en el servidor, la RPC `public.record_verified_attempt` (gracias a su bloqueo `SELECT ... FOR UPDATE` y al índice único parcial `idx_single_awarded_passed_attempt`) devuelve de manera idempotente `{ "already_passed": true, "xp_awarded": 0, "total_xp": ..., "level": ... }`.
+     * El cliente reconoce `already_passed: true` como una persistencia confirmada satisfactoria, actualiza el estado local y procede a retirar el ítem de `localStorage`.
+  5. **Soporte de Sincronización Parcial y Conservación de Pendientes ante Errores:**
+     * Los hasta 3 ejercicios se sincronizan secuencialmente y de forma independiente.
+     * Si el ejercicio #1 y el #2 se persisten exitosamente en Supabase pero el ejercicio #3 falla por un error transitorio de red, límite de tasa (`HTTP 429`) o indisponibilidad (`HTTP 5xx`), el progreso de #1 y #2 queda acreditado permanentemente en la cuenta remota, mientras que el ejercicio #3 se restaura a `sync_status: 'pending'` y se conserva en `localStorage` para reintentarse en la siguiente reconexión.
+     * Si una consulta almacenada hubiera sido manipulada maliciosamente en `localStorage` y al re-evaluarse en el backend devuelve `FAILED` o `ERROR`, se descarta sin otorgar XP y sin bloquear la sincronización de los demás ejercicios válidos.
+  6. **Limpieza Exclusiva tras Persistencia Remota Confirmada:**
+     * Un elemento se elimina de `localStorage` **exclusivamente después de que el backend haya confirmado la persistencia remota** (mediante respuesta `HTTP 200` con evaluación `PASSED` y RPC exitosa, o mediante verificación de registro previo existente en base de datos).
+     * Jamás se eliminan elementos de forma optimista o anticipada.
+     * La clave `qurio_guest_progress_v1` se borra por completo únicamente cuando la lista de pendientes queda en cero.
+  7. **Sin Garantías de Latencia no Comprobadas:** La duración de la migración está supeditada a las condiciones reales de red y ejecución en el sandbox; por ende, no se establecen garantías infundadas de tiempos inferiores a 100 ms, sino que se ofrece una experiencia de sincronización en segundo plano con indicadores de estado claros.
+
+#### 4. Especificación de Pruebas Unitarias y de Integración para `D-05`
+Para blindar el mecanismo de migración ante condiciones reales adversas, se especifican las siguientes pruebas obligatorias en el plan técnico:
+* **Prueba de Interrupción y Recuperación Post-Recarga:** Simular un elemento que quedó en `syncing` tras cierre de navegador (`F5`), verificar que la aplicación recupera el elemento, comprueba el estado remoto en Supabase y lo restaura a `pending` si no estaba persistido.
+* **Prueba de Respuesta HTTP Perdida (Persistencia Huérfana Confirmada):** Simular que la RPC guardó el intento pero la petición HTTP se cortó por timeout de red; verificar que en el siguiente arranque la verificación remota detecta el registro `PASSED` y limpia el elemento local sin enviar un submit innecesario.
+* **Prueba de Reintentos Idempotentes:** Enviar dos veces consecutivas el mismo ejercicio aprobado de invitado; verificar que la segunda ejecución recibe `already_passed: true, xp_awarded: 0` y que no se duplica XP en `user_profiles`.
+* **Prueba de Sincronización Parcial y Conservación de Fallidos:** Simular 3 ejercicios donde el tercero recibe un error `HTTP 500`; verificar que los dos primeros se acreditan en Supabase y se eliminan localmente, mientras que el tercero permanece como `pending` en `localStorage`.
+* **Prueba de Prevención de Carreras Paralelas:** Disparar dos llamadas simultáneas a la migración para el mismo `(user_id, exercise_id)`; verificar que solo una petición viaja por la red.
 
 #### 4. Límites de Ejecución y Prevención de Abuso para Invitados
 * **Lista Blanca de Ejercicios para Invitados en Backend:** Si una petición sin token JWT (`user is None`) intenta invocar `POST /api/v1/exercises/{exercise_id}/submit` para un `exercise_id` fuera de los 3 ejercicios habilitados para invitados, el backend responde con `HTTP 401 Unauthorized` (`code: "REGISTRATION_REQUIRED_AFTER_TRIAL"`), impidiendo que alguien automatice o consuma todo el catálogo sin registrarse limpiando `localStorage`.
@@ -840,11 +886,11 @@ flowchart LR
 ---
 
 ### Fase 10 (Pre-Requisito Inmediato): Estabilización Técnica y Preparación Comercial (`C-01` a `C-05`)
-* **Documento Técnico Rector:** [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) (v1.1).
+* **Documento Técnico Rector:** [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) (v1.2).
 * **Alcance Exclusivo (`D-07`):**
-  1. **`C-01` — Protección de `solution_query`:** Separación entre DTO público (`ExercisePublicDTO`) y modelo interno del evaluador (`ExerciseInternal`), revocación del permiso `SELECT` general sobre `public.exercises` y concesión explícita únicamente a las columnas públicas necesarias para `anon`/`authenticated`, encapsulamiento estricto de `service_role` en el backend, sincronización de fallback con fuente canónica y limpieza de `FALLBACK_EXERCISES` en el frontend.
+  1. **`C-01` — Protección de `solution_query`:** Separación entre DTO público (`ExercisePublicDTO`) y modelo interno del evaluador (`ExerciseInternal`), revocación del permiso `SELECT` general sobre `public.exercises` y concesión explícita únicamente a las columnas públicas necesarias para `anon`/`authenticated`, encapsulamiento estricto de `service_role` en el backend, identificación de `EXERCISES_SEED` (`seed_data.py`) como única fuente maestra del currículo con representaciones derivadas (`02_seed_curriculum.sql` y `FALLBACK_EXERCISES`) y paridad probada en 7 atributos.
   2. **`C-02` — Eliminación de doble persistencia:** Retiro de escrituras directas de intentos, XP, nivel y actividad oficial desde [`persistence.ts`](../../apps/web/src/lib/persistence.ts), [`App.tsx`](../../apps/web/src/App.tsx) y [`useAuth.tsx`](../../apps/web/src/hooks/useAuth.tsx), consolidando al backend y a `record_verified_attempt` como única fuente autoritativa de progreso oficial para usuarios autenticados.
-  3. **`C-03` — Progreso exacto por ruta de aprendizaje:** Cálculo determinista de `completed_exercises` y `total_exercises` filtrado por ejercicios activos y módulos pertenecientes a cada ruta, con manejo de duplicados, rutas vacías y estados de carga.
+  3. **`C-03` — Progreso exacto por ruta de aprendizaje:** Cálculo determinista donde únicamente `authoritativeCompletedIds` determina ejercicios completados para usuarios autenticados (sin usar `ex.is_completed`), lógica separada para invitados, y representación de estados de carga mediante skeleton visual (`is_progress_loading: true`, `completed_exercises: null`).
   4. **`C-04` — Consistencia del esquema de datos (`pagos` vs `metodos_pago`):** Alineación documental y de interfaz con la fuente canónica física ([`database/sandbox/ecommerce_seed.sql`](../../database/sandbox/ecommerce_seed.sql), manteniendo `pagos` y `metodo_pago`) sin alterar el esquema físico ni los datos seed.
   5. **`C-05` — Navegación y URLs reales:** Implementación de enrutamiento basado en History API / `react-router-dom` preservando todos los formatos reales de autenticación de Supabase, esperando la carga del catálogo antes de declarar un 404 en `/exercises/:exerciseId`, y configurando el fallback SPA en el proveedor de hosting.
 
@@ -1410,18 +1456,18 @@ Para que cualquier desarrollador, diseñador o agente subsecuente actúe con tot
 5. **Cuota Óptima del Tutor IA:** Límite de 50 consultas socráticas mensuales por suscriptor Plus como punto de equilibrio entre alto valor pedagógico y costo unitario $< \$12\text{ MXN/mes}$.
 
 #### D. Decisiones Estratégicas y Arquitectónicas Aprobadas por el Propietario del Producto (`D-01` a `D-07`)
-Las 7 decisiones planteadas en la versión 1.0 han sido **aprobadas por el propietario del producto** y rigen la planificación técnica a partir de esta versión **1.1**:
+Las 7 decisiones planteadas en la versión 1.0 han sido **aprobadas por el propietario del producto** y rigen la planificación técnica a partir de esta versión **1.2**:
 
-| # | Decisión Aprobada | Directriz Normativa Vigente en v1.1 | Sección de Referencia |
+| # | Decisión Aprobada | Directriz Normativa Vigente en v1.2 | Sección de Referencia |
 | :-: | :--- | :--- | :--- |
 | **D-01** | **Modelo `Free` vs. `Plus` y Evolución del Catálogo** | **Aprobada:** Mantener ~20 ejercicios gratuitos de SQL como referencia inicial con fundamentos completos. Definir el acceso exclusivamente mediante identificadores estables (`UUID` + `access_tier`) verificados desde el backend (prohibido usar posiciones, índices de arreglos del frontend o variables del cliente). Preservar el progreso y XP de usuarios existentes (*grandfathering*) ante cualquier modificación futura del catálogo. | [Sección 4.5](#45-reglas-de-autorización-free-vs-plus-y-evolución-del-catálogo-sin-pérdida-de-progreso-decisión-aprobada-d-01) |
 | **D-02** | **Identidad de Marca y Jerarquía de Eslóganes** | **Aprobada:** Adoptar **«Aprende datos. Practica. Construye tu futuro.»** como eslogan general de marca multi-tecnología (SQL, Python, Data Analytics, BI) y conservar *«Aprende SQL. Piensa en queries.»* como lema específico de la experiencia SQL. | [Sección 1.1](#11-propósito-y-declaración-de-visión) |
 | **D-03** | **Evaluación de Proveedor de Pagos (Stripe México)** | **Aprobada:** Evaluar a **Stripe México** como candidato inicial documentando ciclo de suscripciones, renovaciones, cancelaciones, webhooks firmados, idempotencia (`provider_event_id`), reembolsos, periodos de gracia (5 días) y métodos locales en México (distinguiendo tarjetas recurrentes vs. SPEI/OXXO de pago único para plan anual), **sin integrar pagos todavía**. | [Sección 4.6](#46-evaluación-técnica-y-operativa-del-proveedor-de-pagos-stripe-méxico-y-alternativas-decisión-aprobada-d-03) |
 | **D-04** | **Arquitectura de Ejecución de Python Independiente** | **Aprobada:** Tratar la arquitectura de ejecución de Python como decisión independiente **sin implementarla aún**. El worker aislado solo ejecuta código Python sin credenciales de Supabase ni permisos sobre datos de usuarios; FastAPI valida la solicitud, coordina la ejecución, conserva la autoridad sobre evaluación/persistencia e invoca la RPC correspondiente. Se mantienen contenedores efímeros, Pyodide/WASM y arquitectura híbrida como alternativas por evaluar sin seleccionar una definitiva sin evaluación técnica documentada. | [Sección 9.6](#96-decisión-arquitectónica-independiente-motor-de-ejecución-de-python-decisión-aprobada-d-04) |
-| **D-05** | **Experiencia de Invitados (3 Ejercicios de Prueba)** | **Aprobada:** Permitir a visitantes no registrados resolver hasta 3 ejercicios como invitado antes del registro, sin otorgar XP oficial para invitados, y con un mecanismo de migración seguro e idempotente que conserva el progreso temporal durante el registro, evita duplicaciones al reintentar, permite sincronización parcial, conserva pendientes ante error y limpia datos locales solo tras confirmar la persistencia remota exitosa. | [Sección 6.5](#65-arquitectura-de-la-experiencia-de-invitados-decisión-aprobada-d-05) |
+| **D-05** | **Experiencia de Invitados (3 Ejercicios de Prueba y Recuperación Resiliente)** | **Aprobada:** Permitir a visitantes no registrados resolver hasta 3 ejercicios como invitado antes del registro, sin otorgar XP oficial para invitados, y con un mecanismo de migración seguro e idempotente que recupera elementos interrumpidos en `syncing`, restaura a `pending`, verifica persistencia remota previa ante respuestas HTTP perdidas, previene ejecuciones paralelas por `(user_id, exercise_id)` y limpia datos locales exclusivamente tras confirmación remota exitosa. | [Sección 6.5](#65-arquitectura-de-la-experiencia-de-invitados-decisión-aprobada-d-05) |
 | **D-06** | **`Qurio Teams` Académico Posicionado tras Validación** | **Aprobada:** Mantener el concepto de licencias institucionales posponiendo precios definitivos y descuentos de `Teams` hasta realizar entrevistas con profesores, pilotos educativos, validación de necesidades, evaluación de costos de soporte y análisis de volumen. | [Sección 4.4](#44-futuro-modelo-b2b-licenciamiento-institucional-y-vías-de-ingreso-adicionales-d-06) |
 | **D-07** | **Prioridades Técnicas Bloqueantes de Fase 10 (`C-01` a `C-05`)** | **Aprobada:** Priorizar y resolver las brechas `C-01` a `C-05` especificadas en [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) antes de avanzar con monetización o *entitlements*. | [Sección 2.2](#22-contradicciones-y-brechas-entre-la-visión-comercial-y-el-estado-actual-del-código) y [Sección 8](#8-roadmap-de-producto-de-12-meses) |
 
 ---
 
-*Fin del Documento — `QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` v1.1*
+*Fin del Documento — `QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` v1.2*
```

---

### 5.2 Diff Completo de `PHASE_10_STABILIZATION_PLAN.md` (v1.2 vs. v1.1)

```diff
diff --git a/docs/roadmap/PHASE_10_STABILIZATION_PLAN.md b/docs/roadmap/PHASE_10_STABILIZATION_PLAN.md
index 11d426a..d1e1f13 100644
--- a/docs/roadmap/PHASE_10_STABILIZATION_PLAN.md
+++ b/docs/roadmap/PHASE_10_STABILIZATION_PLAN.md
@@ -3,10 +3,10 @@
 | Metadato | Detalle |
 | :--- | :--- |
 | **Documento** | `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md` |
-| **Versión** | `1.1` |
+| **Versión** | `1.2` |
 | **Fecha de actualización** | `10 de noviembre de 2026` |
-| **Estado** | **Diagnóstico forense y especificación v1.1 completados — Planificado para ejecución (Código e infraestructura sin modificar)** |
-| **Documento rector vinculado** | [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` (v1.1)](../product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md) |
+| **Estado** | **Diagnóstico forense y especificación v1.2 completados — Planificado para ejecución (Código e infraestructura sin modificar)** |
+| **Documento rector vinculado** | [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` (v1.2)](../product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md) |
 | **Alcance exclusivo** | Brechas técnicas prioritarias **`C-01` a `C-05`** (Decisión Ejecutiva Aprobada **`D-07`**) |
 | **Autoría** | Equipo Multidisciplinario de Software Architecture, Application Security, QA y UX Engineering |
 
@@ -17,7 +17,8 @@
 | Versión | Fecha | Autor / Rol | Descripción del Cambio |
 | :---: | :---: | :--- | :--- |
 | **1.0** | `2026-11-09` | Equipo Multidisciplinario (Software Architecture, AppSec, QA, UX) | Elaboración inicial del Plan de Estabilización de Fase 10 cubriendo el diagnóstico forense de `C-01` a `C-05` y la secuencia de 4 entregables (`PR-10.1` a `PR-10.4`). |
-| **1.1** | `2026-11-10` | Equipo Multidisciplinario (Software Architecture, AppSec, QA, UX) | Refinamiento técnico integral v1.1: (1) En **PR-10.1 (`C-01`)**, especificación de revocación del permiso `SELECT` general de tabla y concesión explícita de columnas públicas, encapsulamiento de `SUPABASE_SERVICE_ROLE_KEY` en backend, sincronización de fallback en memoria con fuente canónica y distinción entre pruebas locales y validación real en un entorno Supabase de pruebas; (2) En **PR-10.2 (`C-02`)**, distinción formal entre progreso autenticado (autoritativo en backend vía `record_verified_attempt` sin modificar la RPC existente) y progreso invitado (temporal en navegador sin XP oficial), ajuste de criterios de aceptación (cero escrituras directas no autorizadas permitiendo lecturas legítimas) y documentación de alcance local de logros/actividad diaria; (3) En **PR-10.3 (`C-03` y `C-04`)**, filtrado de ejercicios activos/excluidos, manejo de rutas vacías, duplicados, carga parcial/estados de carga, fuente autorizada de IDs completados y sincronización canónica con `ecommerce_seed.sql` (`pagos` y `metodo_pago`) sin alterar esquema físico ni seed; (4) En **PR-10.4 (`C-05`)**, preservación de todos los formatos reales de autenticación de Supabase, espera de carga del catálogo antes de determinar 404 en `/exercises/:exerciseId`, pruebas con `history.pushState`/`popstate` y configuración SPA de hosting; (5) Clasificación rigurosa de pruebas en 5 categorías con comportamiento, resultado observable, condición pass/fail, entorno y limitaciones, y sustitución de rutas absolutas por rutas relativas al repositorio. |
+| **1.1** | `2026-11-10` | Equipo Multidisciplinario (Software Architecture, AppSec, QA, UX) | Refinamiento técnico integral v1.1: (1) En **PR-10.1 (`C-01`)**, especificación de revocación del permiso `SELECT` general de tabla y concesión explícita de columnas públicas, encapsulamiento de `SUPABASE_SERVICE_ROLE_KEY` en backend, sincronización de fallback en memoria con fuente canónica y distinción entre pruebas locales y validación real en un entorno Supabase de pruebas; (2) En **PR-10.2 (`C-02`)**, distinción formal entre progreso autenticado y progreso invitado, ajuste de criterios de aceptación y documentación de alcance local de logros/actividad diaria; (3) En **PR-10.3 (`C-03` y `C-04`)**, filtrado de ejercicios activos/excluidos, manejo de rutas vacías, duplicados, carga parcial/estados de carga, fuente autorizada de IDs completados y sincronización canónica con `ecommerce_seed.sql` (`pagos` y `metodo_pago`) sin alterar esquema físico ni seed; (4) En **PR-10.4 (`C-05`)**, preservación de todos los formatos reales de autenticación de Supabase, espera de carga del catálogo antes de determinar 404 en `/exercises/:exerciseId`, pruebas con `history.pushState`/`popstate` y configuración SPA de hosting; (5) Clasificación rigurosa de pruebas en 5 categorías y rutas relativas. |
+| **1.2** | `2026-11-10` | Equipo Multidisciplinario (Software Architecture, AppSec, QA, UX) | **Revisión final de consistencia técnica documental v1.2:**<br>1) En **PR-10.1 (`C-01`)**, declaración formal de `EXERCISES_SEED` en `seed_data.py` como la **única fuente maestra** del currículo y especificación de `02_seed_curriculum.sql` (seed DB con `solution_query`) y `FALLBACK_EXERCISES` en `api.ts` (catálogo cliente de respaldo sin `solution_query`) como **representaciones derivadas**, estableciendo el mecanismo de sincronización y la prueba automatizada de paridad `T-10.1-U3` en 7 atributos (IDs, Títulos, Módulos, Dificultad, XP, Orden y Metadatos públicos);<br>2) En **PR-10.2 (`C-02` / `D-05`)**, especificación detallada del protocolo de recuperación de migraciones interrumpidas para elementos que permanezcan en `syncing` tras cierre o recarga del navegador, restauración segura a `pending`, reintentos idempotentes, tratamiento de respuestas HTTP perdidas verificando el estado remoto (`PASSED` en Supabase) antes de descartar o reintentar, limpieza local exclusivamente tras confirmación de persistencia remota, prevención de sincronizaciones paralelas para el mismo `(user_id, exercise_id)` y adición de pruebas unitarias y de integración (`T-10.2-U3`, `T-10.2-I2`, `T-10.2-I3`);<br>3) En **PR-10.3a (`C-03`)**, corrección estructural de `computeTracksProgress`: eliminación de `ex.is_completed` como condición de aprobación, establecimiento de que únicamente `authoritativeCompletedIds` determina el progreso oficial de usuarios autenticados, separación lógica explícita para progreso temporal de invitados (`computeGuestTrialTracksProgress`), y tratamiento del estado `isLoading` devolviendo un estado explícito de carga (`is_progress_loading: true`, `completed_exercises: null`) para renderizar un skeleton visual en la interfaz en lugar de porcentajes definitivos incorrectos (`0%`), con pruebas unitarias, de integración y de seguridad (`T-10.3-U1`, `T-10.3-U2`, `T-10.3-U4`, `T-10.3-I1`, `T-10.3-S1`). |
 
 ---
 
@@ -206,14 +207,20 @@ GRANT SELECT (
 GRANT SELECT ON public.exercises TO service_role;
 ```
 
-#### 3. Sincronización del Fallback en Memoria con la Fuente Canónica
-* **Fuente canónica única de ejercicios:** La fuente canónica del catálogo en el repositorio es `EXERCISES_SEED` en [`apps/api/app/modules/curriculum/seed_data.py`](../../apps/api/app/modules/curriculum/seed_data.py) sincronizada 1:1 con [`database/supabase/02_seed_curriculum.sql`](../../database/supabase/02_seed_curriculum.sql).
+#### 3. Fuente Maestra Única vs. Representaciones Derivadas y Mecanismo de Sincronización
+* **Fuente Maestra Canónica Única del Currículo:**
+  * Se establece formalmente a `EXERCISES_SEED` (junto con `TRACKS_SEED` y `MODULES_SEED`) en [`apps/api/app/modules/curriculum/seed_data.py`](../../apps/api/app/modules/curriculum/seed_data.py) como la **única fuente maestra canónica de verdad** del catálogo de ejercicios en todo el repositorio.
+* **Representaciones Derivadas:**
+  1. [`database/supabase/02_seed_curriculum.sql`](../../database/supabase/02_seed_curriculum.sql): Representación derivada generada para el sembrado inicial en PostgreSQL/Supabase; contiene `solution_query` para que la base de datos de producción disponga de las soluciones oficiales para el evaluador.
+  2. `FALLBACK_EXERCISES` en [`apps/web/src/lib/api.ts`](../../apps/web/src/lib/api.ts): Representación derivada pública para el cliente web; no contiene `solution_query` y sirve como catálogo de respaldo en memoria ante contingencias de red.
+* **Mecanismo de Sincronización Obligatorio:**
+  * Cualquier cambio, nuevo reto o ajuste pedagógico debe realizarse primeramente en la fuente maestra `seed_data.py` y propagarse de forma controlada a `02_seed_curriculum.sql` (con `solution_query`) y a `api.ts` (sin `solution_query`).
 * **Fallback en memoria del Backend (`ExerciseRepository`):**
   * Si Supabase no está configurado localmente o falla la red, `list_public_exercises()` y `get_public_by_id()` construyen su respuesta aplicando `[ex.to_public_dto() for ex in EXERCISES_SEED.values()]`, garantizando que ni siquiera en modo fallback el backend exponga `solution_query`.
   * Solo `get_internal_for_evaluation(exercise_id)` consulta Supabase autenticándose con `SUPABASE_SERVICE_ROLE_KEY` (encapsulada en backend) o recurre a `EXERCISES_SEED[exercise_id]` en memoria del servidor para entregar `ExerciseInternal` al evaluador.
 * **Fallback en memoria del Frontend (`FALLBACK_EXERCISES` en [`apps/web/src/lib/api.ts`](../../apps/web/src/lib/api.ts)):**
   * Se elimina toda propiedad `solution_query` de los 50 objetos de `FALLBACK_EXERCISES` y de la interfaz `Exercise` en [`apps/web/src/types/index.ts`](../../apps/web/src/types/index.ts).
-  * La sincronización de los metadatos públicos (`id`, `module_id`, `title`, `difficulty`, `xp_reward`, `check_order`, `sort_order`) entre `seed_data.py`, `02_seed_curriculum.sql` y `FALLBACK_EXERCISES` en `api.ts` se valida automáticamente mediante una prueba de paridad en `pytest`.
+  * La sincronización estricta entre la fuente canónica maestra y las representaciones derivadas se valida mediante la prueba automatizada `T-10.1-U3`.
 
 ### 3.6 Especificación Verificable de Pruebas para `PR-10.1` (`C-01`)
 
@@ -225,7 +232,7 @@ GRANT SELECT ON public.exercises TO service_role;
 | :---: | :--- | :--- | :--- | :--- | :--- | :--- |
 | **T-10.1-U1** | **1. Unitaria** | Separación estructural entre `ExerciseInternal` y `ExercisePublicDTO`. | Al convertir los 50 retos de `EXERCISES_SEED` mediante `.to_public_dto()` y `.model_dump()`, ningún diccionario resultante contiene la clave `solution_query`. | **Pasa:** `all("solution_query" not in d for d in dumps)` es `True` para los 50 ejercicios. **Falla:** Si al menos 1 objeto conserva la clave o lanza `ValidationError`. | Local (`pytest`, Python 3.12, sin red). | Solo valida la capa de serialización Pydantic en memoria; no prueba el router HTTP ni la base de datos. |
 | **T-10.1-U2** | **1. Unitaria** | Separación de credenciales y columnas en métodos públicos vs. internos de `ExerciseRepository`. | `list_public_exercises()` y `get_public_by_id()` solicitan únicamente columnas públicas sin `solution_query`; `get_internal_for_evaluation()` utiliza exclusivamente el encabezado con `SUPABASE_SERVICE_ROLE_KEY` en backend. | **Pasa:** El parámetro `select` de los métodos públicos no contiene `solution_query` y el método interno envía `Authorization: Bearer <service_role_key>`. **Falla:** Si un método público pide `solution_query` o si el método interno usa `anon_key`. | Local (`pytest` con mock de `httpx.AsyncClient`). | Al usar un cliente HTTP simulado, no verifica los permisos reales configurados en PostgreSQL. |
-| **T-10.1-U3** | **1. Unitaria** | Sincronización de metadatos públicos entre la fuente canónica (`seed_data.py` / `02_seed_curriculum.sql`) y el fallback en memoria (`FALLBACK_EXERCISES` en `api.ts`). | Los 50 ejercicios coinciden 1:1 en `id`, `module_id`, `title`, `difficulty`, `xp_reward`, `check_order` y `sort_order` entre las tres fuentes. | **Pasa:** Paridad exacta en los 50 registros. **Falla:** Si existe cualquier diferencia de conteo, ID o metadato público. | Local (`pytest` leyendo archivos del repositorio). | Verifica paridad estática en el repositorio; no valida el estado de datos en una instancia remota no migrada. |
+| **T-10.1-U3** | **1. Unitaria** | Sincronización estricta entre la única fuente maestra (`seed_data.py`) y las representaciones derivadas (`02_seed_curriculum.sql` y `FALLBACK_EXERCISES` en `api.ts`). | Los 50 ejercicios coinciden con paridad exacta en los 7 atributos requeridos: 1) IDs (UUIDs); 2) Títulos (`title`); 3) Módulos (`module_id`); 4) Dificultad (`difficulty`); 5) XP (`xp_reward`); 6) Orden (`sort_order`, `check_order`); 7) Metadatos públicos (`prompt`, `initial_code`, `hints`, `sample_data`, `wiki`). | **Pasa:** Paridad 100% en los 7 atributos para los 50 retos y `0` diferencias detectadas. **Falla:** Si existe cualquier discrepancia en IDs, títulos, módulos, dificultad, XP, orden o metadatos públicos. | Local (`pytest` leyendo archivos del repositorio). | Verifica paridad estática en el repositorio; no valida el estado de datos en una instancia remota no migrada. |
 | **T-10.1-I1** | **2. Integración** | Ausencia de `solution_query` en respuestas de los endpoints públicos `GET /api/v1/exercises` y `GET /api/v1/exercises/{id}`, tanto con Supabase activo como en modo fallback en memoria. | Respuestas `HTTP 200 OK` con la lista de 50 ejercicios y el detalle individual conteniendo `id`, `title`, `prompt`, `initial_code`, `sample_data`, `hints` y `wiki`, pero sin `solution_query`. | **Pasa:** Código `200` y `"solution_query" not in response.json()` en ambos modos (online y fallback). **Falla:** Si aparece `solution_query` en cualquier nodo del JSON. | Local (`pytest` + `FastAPI TestClient`). | Prueba la tubería completa de FastAPI, pero contra repositorio local/mockeado si no se conecta a Supabase. |
 | **T-10.1-I2** | **2. Integración** | Funcionamiento de `POST /api/v1/exercises/{id}/submit` utilizando `ExerciseInternal` en el backend sin filtrar `solution_query` en `EvaluationResponse`. | Al enviar una consulta válida e inválida al endpoint `/submit`, el evaluador ejecuta `solution_query` internamente y devuelve `PASSED`/`FAILED` sin incluir `solution_query` en el cuerpo de respuesta. | **Pasa:** Veredicto semántico correcto y `"solution_query" not in response.json()`. **Falla:** Si falla la evaluación por falta de `solution_query` interna o si se filtra en la respuesta. | Local (`pytest` + `FastAPI TestClient` + contenedor `qurio-sandbox-db`). | Requiere que el contenedor Docker del PostgreSQL Sandbox esté en ejecución para probar la ejecución SQL real. |
 | **T-10.1-S1** | **3. Seguridad** | Inspección de código fuente, variables de entorno y bundle compilado de producción (`apps/web/dist/`) para confirmar cero filtración de `solution_query` y `SUPABASE_SERVICE_ROLE_KEY`. | Al ejecutar `npm run build` en `apps/web` e inspeccionar `apps/web/src/`, `apps/web/.env*` y `apps/web/dist/assets/*.js`, no existen las cadenas `solution_query` ni `service_role`. | **Pasa:** `0` coincidencias de `solution_query` y `0` variables `VITE_*SERVICE_ROLE*` en código fuente y artefactos de `dist/`. **Falla:** Si aparece cualquier coincidencia (>= 1). | Local (`npm run build` + `pytest` / escaneo estático sobre `dist/`). | Debe ejecutarse siempre después de compilar un build fresco (`vite build`) para inspeccionar el artefacto real. |
@@ -352,7 +359,25 @@ En [`router.py`](../../apps/api/app/modules/runner/router.py) (líneas 164–197
 * **En `useAuth.tsx`:** En `fetchProfile`, invocar `persistence.cacheProfileLocally(loadedProfile)` en vez de `updateProfile`, y eliminar `.from('user_profiles').insert(...)`.
 * **En `App.tsx`:** Para usuarios autenticados, actualizar `user.total_xp` y `user.current_level` exclusivamente con `result.total_xp` y `result.level` devueltos por `EvaluationResponse`, y obtener la lista de ejercicios completados de la fuente autoritativa de Supabase (`getCompletedExerciseIds(user.id)`), nunca permitiendo que datos residuales de `localStorage` inflen el XP o autoricen ejercicios no registrados en el servidor.
 
-### 4.6 Especificación Verificable de Pruebas para `PR-10.2` (`C-02`)
+#### 3. Especificación de Migración de Invitados (`D-05`): Recuperación ante Interrupciones, Idempotencia y Cero Falsos Descartes
+Para resolver de forma determinista la migración del progreso temporal acumulado en `qurio_guest_progress_v1` hacia la cuenta autenticada:
+1. **Recuperación de elementos bloqueados en `syncing`:**
+   * Cada elemento en `qurio_guest_progress_v1` registra `{ exercise_id, submitted_sql, hints_used, passed_at, sync_status, sync_started_at, session_instance_id }`.
+   * Si el usuario cierra el navegador, recarga con `F5` o sufre una desconexión mientras un elemento estaba en `syncing`, al inicializarse la aplicación se detecta si `sync_started_at` excede un umbral de candado obsoleto (*stale lock* de 30 s) o si la pestaña actual tiene un `session_instance_id` distinto.
+2. **Tratamiento de Respuesta HTTP Perdida (Verificación Remota Previa):**
+   * Antes de descartar o re-enviar un elemento que quedó interrumpido en `syncing`, el cliente ejecuta una verificación de estado remoto: `GET /rest/v1/exercise_attempts?user_id=eq.{user_id}&exercise_id=eq.{exercise_id}&status=eq.PASSED&select=id`.
+   * **Caso A (Persistido remotamente antes de la desconexión):** Si el intento `PASSED` ya existe en Supabase, la persistencia remota está confirmada. El cliente retira el elemento de `localStorage` inmediatamente sin ejecutar reintentos innecesarios.
+   * **Caso B (No persistido en servidor):** El cliente restaura de forma segura el elemento a `sync_status: 'pending'`, limpiando `sync_started_at` para permitir un reintento limpio.
+3. **Prevención de Sincronizaciones Paralelas:**
+   * Se establece un candado en memoria a nivel de clave compuesta `${user_id}:${exercise_id}`. Si múltiples eventos concurrentes (`onAuthStateChange`, reconexión de red) intentan sincronizar el mismo ejercicio para el mismo usuario, solo una petición viaja a la red; las demás se descartan.
+4. **Reintentos Idempotentes:**
+   * Todo reintento hacia `POST /api/v1/exercises/{exercise_id}/submit` es procesado por la RPC `record_verified_attempt`. Si el intento ya había sido acreditado, la RPC retorna `{ "already_passed": true, "xp_awarded": 0, "total_xp": ..., "level": ... }`. El cliente trata esta respuesta como persistencia confirmada y elimina el elemento local.
+5. **Limpieza Exclusiva tras Confirmación Remota:**
+   * Jamás se elimina un elemento de `qurio_guest_progress_v1` de forma optimista. La limpieza se ejecuta única y exclusivamente tras recibir confirmación remota del backend o comprobar el registro existente en base de datos.
+6. **Sin Garantías de Latencia no Verificadas:**
+   * No se comprometen tiempos artificiales (como $< 100\text{ ms}$). La interfaz muestra un indicador no intrusivo de sincronización en segundo plano hasta recibir la respuesta del servidor.
+
+### 4.6 Especificación Verificable de Pruebas para `PR-10.2` (`C-02` y `D-05`)
 
 > [!NOTE]
 > **Estado de las Pruebas:** Las pruebas listadas a continuación están **planificadas para `PR-10.2` y aún no han sido ejecutadas**.
@@ -361,7 +386,10 @@ En [`router.py`](../../apps/api/app/modules/runner/router.py) (líneas 164–197
 | :---: | :--- | :--- | :--- | :--- | :--- | :--- |
 | **T-10.2-U1** | **1. Unitaria** | Propagación de campos autoritativos de `record_verified_attempt` hacia `EvaluationResponse` en FastAPI. | Cuando la RPC retorna `{"xp_awarded": 10, "total_xp": 150, "level": 2, "already_passed": False}`, el endpoint `/submit` devuelve exactamente esos valores en `xp_earned`, `total_xp`, `level` y `already_passed`. | **Pasa:** Los 4 campos coinciden exactamente en el JSON de respuesta. **Falla:** Si alguno es `None` o si `xp_earned` se calcula en cliente/router ignorando la RPC. | Local (`pytest` con mock de `supabase_admin.record_verified_attempt`). | No ejecuta la función PL/pgSQL real en Supabase; valida el contrato de salida de FastAPI. |
 | **T-10.2-U2** | **1. Unitaria** | Filtrado estricto de columnas permitidas en `persistence.updateProfile`. | 1) Si se invoca con `{ total_xp: 500, current_level: 4 }`, se realizan `0` llamadas a `supabase.from('user_profiles').update`.<br>2) Si se invoca con `{ display_name: "Ana", bio: "SQL", total_xp: 999 }`, el payload enviado a `.update()` contiene solo `display_name`, `bio` y `updated_at`. | **Pasa:** Cero llamadas en el caso 1 y ausencia total de `xp`, `level`, `username`, `current_streak_days` en el payload del caso 2. **Falla:** Si se incluye cualquier columna protegida. | Local (Vitest / test unitario TS con mock del cliente Supabase). | Valida el cliente TypeScript en aislamiento; la política CLS real se verifica en `T-10.2-SB1`. |
+| **T-10.2-U3** | **1. Unitaria** | Detección de candado obsoleto y prevención de ejecuciones paralelas por `(user_id, exercise_id)` en la migración de invitados. | 1) Un elemento con `sync_status: 'syncing'` y `sync_started_at` de hace más de 30 s es restaurado a `pending`.<br>2) Dos llamadas simultáneas de sincronización para el mismo `(user_id, exercise_id)` provocan que solo 1 llamada ejecute la petición de red, mientras la segunda es contenida por el candado en memoria. | **Pasa:** Restauración segura a `pending` y exactamente 1 despacho de red para llamadas concurrentes idénticas. **Falla:** Si se permiten llamadas de red paralelas o el candado obsoleto queda colgado indefinidamente. | Local (Vitest / TypeScript puro). | Prueba la máquina de estados del cliente en aislamiento sin red real. |
 | **T-10.2-I1** | **2. Integración** | Diferenciación entre intento de usuario autenticado e intento de usuario invitado en `POST /api/v1/exercises/{id}/submit`. | 1) Con JWT válido: se invoca `record_verified_attempt` una vez y se devuelven `total_xp` y `level`.<br>2) Sin JWT (invitado): no se invoca `record_verified_attempt`, `xp_earned == 0`, `total_xp is None` y `level is None`. | **Pasa:** Ambos flujos cumplen exactamente las aserciones. **Falla:** Si el invitado dispara la RPC o recibe XP oficial. | Local (`pytest` + `FastAPI TestClient` + Sandbox Docker). | La persistencia en Supabase se simula mediante espía sobre `supabase_admin`. |
+| **T-10.2-I2** | **2. Integración** | Recuperación ante interrupción del navegador y respuesta HTTP perdida en la migración de invitados (`D-05`). | Se inyecta en `localStorage` un elemento en estado `syncing` con respuesta HTTP perdida, habiendo quedado registrado `PASSED` en la base de datos simulada. Al montar la aplicación tras recarga (`F5`), el cliente verifica el estado remoto en Supabase, constata que ya está aprobado y limpia el ítem localmente sin re-enviar la consulta. | **Pasa:** Detección de persistencia remota huérfana, eliminación de `localStorage` y `0` re-envíos duplicados de submit. **Falla:** Si se descarta el elemento sin verificar el servidor o si se re-ejecuta innecesariamente. | Local (Vitest + React Testing Library con mock de Supabase REST). | Simula la respuesta de PostgREST localmente. |
+| **T-10.2-I3** | **2. Integración** | Sincronización parcial con fallo temporal y reintento idempotente (`D-05`). | Se simulan 3 ejercicios de invitado donde los retos 1 y 2 retornan `200 OK` (`PASSED`), y el reto 3 retorna `503 Service Unavailable`. Los retos 1 y 2 se limpian de `localStorage`, mientras que el reto 3 regresa a `pending`. En el segundo intento, el reto 3 responde `already_passed: true, xp_awarded: 0` y se limpia de `localStorage`. | **Pasa:** Conservación estricta de ítems fallidos en `localStorage`, acreditación de aprobados y manejo idempotente sin otorgar XP duplicado. **Falla:** Si se pierde el ítem 3 o se duplica XP. | Local (Vitest con mock de backend FastAPI y Supabase). | Prueba la resiliencia del cliente ante fallos transitorios de red. |
 | **T-10.2-S1** | **3. Seguridad** | Prohibición de que `localStorage` autorice XP o aprobación oficial de ejercicios para usuarios autenticados. | Si un usuario autenticado manipula `localStorage` inyectando `total_xp: 99999` o IDs falsos en `qurio_attempts`, al cargar o refrescar la sesión prevalecen exclusivamente el `xp`/`level` de `public.user_profiles` y los intentos `PASSED` de `public.exercise_attempts` en el servidor. | **Pasa:** La UI muestra el XP real del servidor y solo marca como completados los ejercicios certificados en Supabase. **Falla:** Si el valor adulterado en `localStorage` altera el XP o el estado oficial. | Local (Test de integración Frontend con sesión autenticada simulada). | Verifica la inmunidad del cliente ante manipulación de `localStorage`. |
 | **T-10.2-B1** | **4. Navegador / UX** | Monitoreo de peticiones HTTP desde el navegador durante login, envío de ejercicio (`PASSED`/`FAILED`) y edición de perfil. | Se permiten las lecturas legítimas (`GET /rest/v1/user_profiles`, `GET /rest/v1/exercise_attempts`) y el `PATCH` legítimo al editar `display_name`/`bio`, pero ocurren **cero escrituras directas no autorizadas** (`POST`/`PATCH`) hacia `exercise_attempts`, `user_daily_activity` o columnas de XP/nivel al resolver ejercicios. | **Pasa:** `0` peticiones de escritura directa no autorizada desde el navegador y `0` respuestas `403 / 42501` en la pestaña *Network*. **Falla:** Si el navegador intenta insertar intentos o actualizar XP directamente. | Navegador real / DevTools con frontend Vite y backend FastAPI. | Requiere inspección del tráfico hacia el dominio `*.supabase.co/rest/v1/*`. |
 | **T-10.2-SB1** | **5. Entorno Supabase de Pruebas** | Ejecución real end-to-end contra un proyecto Supabase de pruebas: envío de ejercicio autenticado y edición de `display_name` y `bio` en `ProfileView`. | 1) La RPC `record_verified_attempt` incrementa `xp` en la primera aprobación y devuelve `already_passed: true, xp_awarded: 0` en la segunda.<br>2) `PATCH /rest/v1/user_profiles` con `{ display_name, bio }` devuelve `200/204`.<br>3) `PATCH /rest/v1/user_profiles` intentando enviar `{ xp: 9999 }` con JWT de usuario devuelve `403 (42501)`. | **Pasa:** Las 3 operaciones se comportan conforme a las políticas RLS/CLS reales de Supabase. **Falla:** Si falla la edición legítima de perfil o si se permite modificar `xp` desde el cliente. | Entorno Supabase de pruebas (*Staging / Test Project*). | Confirma la compatibilidad real entre el código refactorizado en `PR-10.2` y `03_security_hardening.sql`. |
@@ -370,8 +398,9 @@ En [`router.py`](../../apps/api/app/modules/runner/router.py) (líneas 164–197
 * [ ] Para usuarios autenticados, el backend es la única fuente autoritativa del progreso oficial; `localStorage` jamás autoriza la aprobación oficial de ejercicios ni la concesión de XP.
 * [ ] `EvaluationResponse` propaga `xp_earned`, `total_xp`, `level` y `already_passed` devueltos por `record_verified_attempt()`, sin modificar la RPC existente.
 * [ ] Para usuarios invitados, el progreso se mantiene solo de forma temporal en el navegador sin otorgar XP oficial ni escribir en Supabase.
+* [ ] El protocolo de migración de invitados recupera de forma segura elementos interrumpidos en `syncing`, restaura a `pending`, verifica el estado remoto en Supabase antes de descartar o reintentar ante respuestas HTTP perdidas, y previene sincronizaciones paralelas por `(user_id, exercise_id)`.
 * [ ] Existen **cero escrituras directas no autorizadas desde el navegador** hacia tablas de intentos, XP, niveles o actividad oficial en Supabase (manteniendo operativas las lecturas legítimas `GET` y la edición autorizada de `display_name`, `avatar_url` y `bio`).
 * [ ] Queda documentado explícitamente que los logros y la actividad diaria que permanecen en `localStorage` no se sincronizan entre dispositivos.
 
 ### 4.8 Estimación de Complejidad y Orden Recomendado
 * **Complejidad:** **Media (`M` — ~3 a 4 horas).**
@@ -429,7 +458,7 @@ La inspección de [`apps/web/src/App.tsx`](../../apps/web/src/App.tsx) confirmó
 
 ### 5.4 Solución Propuesta
 
-En lugar de mantener contadores mutables e incrementar `+1` de forma imperativa, **el progreso de cada ruta se define como una función pura, determinista e idempotente** que cruza los módulos de cada ruta, el catálogo filtrado de ejercicios activos y el conjunto autoritativo de IDs completados:
+En lugar de mantener contadores mutables e incrementar `+1` de forma imperativa o depender de banderas frágiles como `ex.is_completed`, **el progreso de las rutas se calcula mediante funciones puras, deterministas y con estricta separación de autoridad entre usuarios autenticados e invitados**:
 
 ```typescript
 export interface TrackProgressOptions {
@@ -437,22 +466,35 @@ export interface TrackProgressOptions {
   isLoading?: boolean;
 }
 
+export interface TrackWithProgress extends Track {
+  /** Indica si el cálculo está en espera de la carga de catálogo o intentos */
+  is_progress_loading: boolean;
+  /** Cantidad de ejercicios completados; null durante la carga para evitar falsos ceros */
+  completed_exercises: number | null;
+  /** Porcentaje de avance [0, 100]; null durante la carga */
+  progress_percent: number | null;
+}
+
 /**
- * Calcula de forma determinista el total de ejercicios activos y completados
- * pertenecientes exclusivamente a los módulos de cada ruta.
+ * Calcula de forma determinista el progreso oficial para usuarios autenticados.
+ * ÚNICAMENTE authoritativeCompletedIds (proveniente de la base de datos o de
+ * respuestas confirmadas del backend) puede marcar un ejercicio como completado.
+ * La propiedad local ex.is_completed es ESTRICTAMENTE IGNORADA.
  */
-export function computeTracksProgress(
+export function computeOfficialTracksProgress(
   tracks: Track[],
   exercises: Exercise[],
   authoritativeCompletedIds: Iterable<string>,
   options: TrackProgressOptions = {}
-): Track[] {
-  // 1. Mientras la carga inicial siga en curso, no fabricar porcentajes falsos
-  //    sobre estados temporales o incompletos.
+): TrackWithProgress[] {
+  // 1. Mientras la carga inicial o sincronización de intentos siga en curso,
+  //    retornar estado de carga explícito (null), NUNCA un 0 definitivo ni 0%.
   if (options.isLoading) {
     return tracks.map((track) => ({
       ...track,
-      completed_exercises: 0,
+      is_progress_loading: true,
+      completed_exercises: null,
+      progress_percent: null,
     }));
   }
 
@@ -460,7 +502,7 @@ export function computeTracksProgress(
   const seenExerciseIds = new Set<string>();
   const statsByModule = new Map<string, { total: number; completed: number }>();
 
-  // 2. Filtrar ejercicios activos y no excluidos/archivados, evitando duplicados
+  // 2. Filtrar ejercicios activos y no archivados
   for (const ex of exercises) {
     if (!ex || !ex.id || !ex.module_id) continue;
     if ((ex as { is_active?: boolean }).is_active === false) continue;
@@ -471,7 +513,9 @@ export function computeTracksProgress(
 
     const current = statsByModule.get(ex.module_id) ?? { total: 0, completed: 0 };
     current.total += 1;
-    if (completedSet.has(ex.id) || ex.is_completed === true) {
+
+    // REGLA ESTRICTA C-03: Solo el conjunto autoritativo puede acreditar aprobación oficial
+    if (completedSet.has(ex.id)) {
       current.completed += 1;
     }
     statsByModule.set(ex.module_id, current);
@@ -494,28 +538,52 @@ export function computeTracksProgress(
       }
     }
 
-    // 3. Manejo seguro de rutas vacías o con carga parcial:
-    //    El numerador y el denominador provienen SIEMPRE del mismo subconjunto
-    //    de ejercicios activos cargados para los módulos de esa ruta.
     const safeCompleted = trackTotal > 0 ? Math.min(trackTotal, trackCompleted) : 0;
+    const progressPercent = trackTotal > 0 ? Math.min(100, Math.round((safeCompleted / trackTotal) * 100)) : 0;
 
     return {
       ...track,
+      is_progress_loading: false,
       total_exercises: trackTotal,
       completed_exercises: safeCompleted,
+      progress_percent: progressPercent,
     };
   });
 }
+
+/**
+ * Función separada y explícita para progreso temporal de usuarios invitados (D-05).
+ * Acotada estrictamente a los 3 ejercicios de prueba del Módulo 1.
+ */
+export function computeGuestTrialTracksProgress(
+  tracks: Track[],
+  exercises: Exercise[],
+  guestTrialCompletedIds: Iterable<string>,
+  options: TrackProgressOptions = {}
+): TrackWithProgress[] {
+  const allowedTrialIds = new Set([
+    'e0000000-0000-0000-0000-000000000001',
+    'e0000000-0000-0000-0000-000000000008',
+    'e0000000-0000-0000-0000-000000000019',
+  ]);
+  const filteredGuestIds = Array.from(guestTrialCompletedIds).filter((id) => allowedTrialIds.has(id));
+  return computeOfficialTracksProgress(tracks, exercises, filteredGuestIds, options);
+}
 ```
 
+#### Representación Visual del Estado de Carga (`isLoading`) en la Interfaz:
+* **Problema resuelto:** Anteriormente, cuando el catálogo o los intentos tardaban 300–800 ms en cargar, la función retornaba `completed_exercises: 0`, provocando un parpadeo de `"0 / 22 (0%)"` antes de saltar a `"15 / 22 (68%)"`, o confundiendo a un usuario novato que pensaba que su progreso se había reiniciado.
+* **Comportamiento en UI (`TrackCard`, `TracksView`, `DashboardView`):**
+  * Cuando `track.is_progress_loading === true` o `track.completed_exercises === null`:
+    1. La barra de progreso muestra una animación de carga (*shimmer skeleton* en `bg-surface-container-highest animate-pulse`).
+    2. El texto de conteo numérico (`"X / Y"`) y el porcentaje se sustituyen por una etiqueta sutil: `"Sincronizando progreso..."`.
+    3. Se evita por completo mostrar porcentajes numéricos incorrectos o `0%` transitorio.
+
 #### Garantías sobre Casos Borde Obligatorios:
-1. **Filtrado de ejercicios activos y excluidos:** Cualquier ejercicio marcado como inactivo (`is_active: false`), archivado (`is_archived: true`) o cuyo `module_id` no pertenezca a los módulos de la ruta queda excluido tanto del numerador (`completed_exercises`) como del denominador (`total_exercises`).
-2. **Prevención de duplicaciones:** Se aplican conjuntos `Set<string>` tanto a los IDs de ejercicios (`seenExerciseIds`), como a los IDs de módulos (`seenModuleIds`) y a los IDs completados (`completedSet`). Aprobar un ejercicio 10 veces o recibir un arreglo con entradas duplicadas produce exactamente el mismo resultado.
-3. **Rutas vacías (`modules: []` o módulos sin ejercicios activos):** Devuelven `total_exercises: 0` y `completed_exercises: 0`, y `TrackCard` evalúa `total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0`, evitando `NaN` o `Infinity`.
-4. **Carga parcial y estados de carga (`isLoading`):**
-   * Mientras `isLoading` sea `true`, no se emiten porcentajes transitorios erróneos.
-   * Nunca se mezcla un numerador calculado sobre una fuente con un denominador estático desacoplado (`track.total_exercises` antiguo), evitando que una carga parcial o cambio de catálogo produzca porcentajes inconsistentes o mayores al 100%.
-5. **Fuente autorizada para usuarios autenticados:** Para usuarios con sesión activa, `authoritativeCompletedIds` proviene exclusivamente de los intentos `PASSED` verificados en el servidor (más los aprobados en la sesión vía `EvaluationResponse`), impidiendo que el progreso local de un invitado previo en el mismo navegador contamine el progreso del usuario autenticado.
+1. **Exclusividad de `authoritativeCompletedIds` para usuarios autenticados:** Ninguna propiedad local del catálogo (`ex.is_completed = true`) ni ningún arreglo manipulado en `localStorage` puede incrementar el contador oficial de ejercicios completados.
+2. **Separación lógica de invitados:** El progreso de prueba de un invitado se calcula mediante una función independiente (`computeGuestTrialTracksProgress`), impidiendo cualquier mezcla con las estadísticas de usuarios registrados.
+3. **Filtrado de ejercicios activos y excluidos:** Ejercicios con `is_active: false`, `is_archived: true` o con `module_id` ajeno no suman al numerador ni al denominador.
+4. **Prevención de duplicaciones y rutas vacías:** El uso de conjuntos `Set` previene duplicados; rutas sin módulos o con cero ejercicios devuelven `0 / 0` y `0%` de manera segura, sin arrojar `NaN` ni `Infinity`.
 
 ### 5.5 Especificación Verificable de Pruebas para `C-03` (`PR-10.3a`)
 
@@ -524,10 +592,12 @@ export function computeTracksProgress(
 
 | ID Prueba | Categoría | Comportamiento Verificado | Resultado Observable Esperado | Condición de Aprobación / Fallo (Pass/Fail) | Entorno Requerido | Limitaciones |
 | :---: | :--- | :--- | :--- | :--- | :--- | :--- |
-| **T-10.3-U1** | **1. Unitaria** | Aislamiento entre rutas y conteo exacto en `computeTracksProgress`. | Dados 3 tracks (`sql-foundations` con 22 retos, `relational-sql` con 18, `advanced-queries` con 10) y 5 IDs completados de `m01`/`m02`, devuelve `5/22`, `0/18` y `0/10`. | **Pasa:** `completed_exercises` es `[5, 0, 0]` y `total_exercises` es `[22, 18, 10]`. **Falla:** Si alguna otra ruta muestra `> 0`. | Local (Vitest / TypeScript puro). | Prueba lógica pura en memoria; no valida el renderizado DOM. |
-| **T-10.3-U2** | **1. Unitaria** | Manejo de duplicados, ejercicios excluidos/inactivos, IDs huérfanos, rutas vacías y estado `isLoading: true`. | 1) Entradas duplicadas de un mismo `exercise.id` cuentan solo `1` vez.<br>2) Ejercicios con `is_active: false` o `is_archived: true` se excluyen.<br>3) Ruta sin módulos o sin ejercicios produce `0 / 0 (0%)` sin `NaN`.<br>4) Con `isLoading: true`, `completed_exercises` permanece en `0`. | **Pasa:** Todos los casos borde devuelven enteros válidos con `0 <= completed <= total`. **Falla:** Si aparece `NaN`, `completed > total` o se cuentan ejercicios inactivos/duplicados. | Local (Vitest / TypeScript puro). | No evalúa la consulta de red a Supabase. |
-| **T-10.3-I1** | **2. Integración** | Uso exclusivo de la fuente autorizada de IDs completados para usuarios autenticados frente a contaminación en `localStorage`. | Si `localStorage` tiene 8 ejercicios en `qurio_attempts` pero el servidor (`exercise_attempts` de `user.id`) reporta solo 2 ejercicios `PASSED`, la sesión autenticada muestra `2 / 22` en Ruta 1. | **Pasa:** El conteo mostrado al usuario autenticado es `2 / 22`. **Falla:** Si muestra `8 / 22` o suma ambos sin verificar pertenencia al usuario. | Local (Test de integración Frontend con mock de Supabase Auth y REST). | Simula la respuesta de Supabase REST localmente. |
-| **T-10.3-B1** | **4. Navegador / UX** | Coherencia matemática entre `TrackCard` (vista `/tracks` y `/dashboard`) y la suma de `ModuleAccordion` (detalle de ruta) tras aprobar por primera vez y re-aprobar un ejercicio. | 1) Al aprobar un ejercicio nuevo de `m05` (*Relational SQL*), solo la tarjeta de *Relational SQL* sube en `+1`.<br>2) Al volver a enviar el mismo ejercicio y obtener `PASSED` por segunda vez, el contador permanece inalterado.<br>3) En todo momento $\sum \text{completados por módulo} == \text{completados en TrackCard}$. | **Pasa:** Paridad matemática exacta entre tarjetas y acordeones en las 3 rutas. **Falla:** Si re-aprobar incrementa el contador o si difieren tarjeta y acordeones. | Navegador real / Playwright contra frontend + backend local. | Requiere flujo interactivo de navegador. |
+| **T-10.3-U1** | **1. Unitaria** | Aislamiento entre rutas y conteo exacto basado exclusivamente en `authoritativeCompletedIds`. | Dados 3 tracks (`sql-foundations` con 22 retos, `relational-sql` con 18, `advanced-queries` con 10) y 5 IDs completados de `m01`/`m02`, devuelve `5/22 (23%)`, `0/18 (0%)` y `0/10 (0%)`. | **Pasa:** `completed_exercises` es `[5, 0, 0]` y `total_exercises` es `[22, 18, 10]`. **Falla:** Si alguna otra ruta muestra `> 0`. | Local (Vitest / TypeScript puro). | Prueba lógica pura en memoria; no valida el renderizado DOM. |
+| **T-10.3-U2** | **1. Unitaria** | Manejo de duplicados, ejercicios inactivos, rutas vacías y estado `isLoading: true`. | 1) Ejercicios duplicados cuentan `1` vez.<br>2) Ejercicios con `is_active: false` o `is_archived: true` se excluyen de total y completados.<br>3) Rutas sin ejercicios devuelven `0 / 0 (0%)` sin `NaN`.<br>4) Con `isLoading: true`, devuelve `is_progress_loading: true`, `completed_exercises: null` y `progress_percent: null`. | **Pasa:** Se devuelven valores `null` en carga y enteros correctos sin `NaN` al finalizar. **Falla:** Si en `isLoading: true` se emite `0` o `0%` indistinguible de progreso real. | Local (Vitest / TypeScript puro). | No evalúa la consulta de red a Supabase. |
+| **T-10.3-U4** | **1. Unitaria** | Separación entre progreso oficial autenticado y progreso de prueba de invitado (`computeGuestTrialTracksProgress`). | 1) `computeGuestTrialTracksProgress` solo permite como completados los 3 retos de prueba de M01.<br>2) Si un invitado intenta inyectar el ID del reto #35 (M07), dicho ID es filtrado y el progreso permanece en `0`. | **Pasa:** Solo los 3 retos autorizados de M01 son computables en la función de invitado. **Falla:** Si un ID ajeno a los 3 de prueba suma en la función de invitado. | Local (Vitest / TypeScript puro). | Valida el aislamiento algorítmico en cliente. |
+| **T-10.3-I1** | **2. Integración** | Inmunidad del progreso autenticado ante inyección manual de `localStorage` y de `ex.is_completed = true` en el catálogo. | Se inyectan 8 IDs en `qurio_attempts` de `localStorage` y se mutan 5 objetos de `exercises` asignándoles `is_completed: true`. Cuando el usuario autenticado tiene solo 2 intentos `PASSED` en Supabase, la vista de rutas muestra estrictamente `2 / 22`. | **Pasa:** El progreso mostrado es `2 / 22`. **Falla:** Si `localStorage` o `ex.is_completed = true` incrementan el progreso oficial. | Local (Vitest + React Testing Library con mock de Supabase Auth/REST). | Prueba la integración de componentes React con el store de sesión. |
+| **T-10.3-S1** | **3. Seguridad** | Prohibición absoluta de que `ex.is_completed` autorice avance oficial o desbloqueo de certificados. | Un script altera el arreglo en memoria asignando `ex.is_completed = true` a todos los ejercicios de la Ruta 1. El motor de certificación y las tarjetas de ruta consultan la función oficial y comprueban que el progreso permanece vinculado a los IDs verificados del servidor. | **Pasa:** Cero aprobación oficial y `0%` sin certificados emitibles. **Falla:** Si la mutación cliente autoriza la ruta. | Local (Vitest / TypeScript puro). | Verifica integridad frente a manipulaciones de DevTools. |
+| **T-10.3-B1** | **4. Navegador / UX** | Coherencia matemática entre `TrackCard` y `ModuleAccordion`, y renderizado del skeleton de carga durante `isLoading`. | 1) Durante la carga inicial, `TrackCard` muestra el skeleton `Sincronizando progreso...` sin parpadear `0%`.<br>2) Al resolverse la carga, muestra los porcentajes reales.<br>3) Re-aprobar un ejercicio ya completado mantiene el conteo inalterado.<br>4) $\sum \text{completados por módulo} == \text{completados en TrackCard}$. | **Pasa:** Paridad matemática exacta y transición fluida del skeleton al valor definitivo sin parpadeo de 0%. **Falla:** Si parpadea un 0% transitorio o re-aprobar incrementa el contador. | Navegador real / Playwright contra frontend + backend local. | Requiere flujo interactivo de navegador. |
 
 ---
 
@@ -588,8 +658,10 @@ La comparación cruzada entre el motor físico del Sandbox, el evaluador del bac
 | **T-10.3-B2** | **4. Navegador / UX** | Renderizado de las 10 tablas canónicas en la pestaña "Esquema" de `ExerciseSpecPanel` y en el autocompletado de Monaco (`sqlCompleter.ts`). | Al abrir cualquier ejercicio en el IDE y seleccionar la pestaña "Esquema", se muestran las 10 tablas reales (incluyendo `facturas` y `pagos` con `metodo_pago`), sin columnas inexistentes como `pedidos.monto` o `categorias.activa`. | **Pasa:** Las 10 tablas y sus columnas exactas son visibles en el DOM de la pestaña "Esquema". **Falla:** Si faltan tablas o aparecen columnas ficticias. | Local (Vitest + React Testing Library / Navegador real). | Verifica la representación visual en el frontend. |
 
 ### 6.5 Criterios de Aceptación de `PR-10.3` (`C-03` + `C-04`)
-* [ ] `computeTracksProgress` filtra correctamente ejercicios activos y excluidos, deduplica IDs y maneja de forma segura rutas vacías, carga parcial y estados `isLoading`.
-* [ ] Para usuarios autenticados, el cálculo de progreso utiliza exclusivamente la fuente autorizada de ejercicios completados.
+* [ ] Para usuarios autenticados, únicamente `authoritativeCompletedIds` determina los ejercicios completados; `ex.is_completed` es estrictamente ignorado y jamás autoriza aprobación oficial.
+* [ ] El progreso temporal para invitados opera bajo una función explícita separada (`computeGuestTrialTracksProgress`) sin mezclarse con el progreso de usuarios autenticados.
+* [ ] Mientras el catálogo o los intentos continúen cargando (`isLoading: true`), `completed_exercises` y `progress_percent` retornan `null` y la interfaz renderiza un skeleton visual sin mostrar porcentajes incorrectos ni ceros falsos.
+* [ ] Las pruebas comprueban que manipular tanto `localStorage` como propiedades locales del catálogo (`ex.is_completed = true`) no incrementa el progreso oficial de usuarios autenticados.
 * [ ] Cada tarjeta de ruta en `TracksView` y `DashboardView` muestra exclusivamente el conteo de ejercicios completados pertenecientes a esa ruta, y re-ejecutar un ejercicio ya completado jamás incrementa `completed_exercises`.
 * [ ] `database/sandbox/ecommerce_seed.sql` queda establecida como fuente canónica (manteniendo la tabla `pagos` y la columna `metodo_pago` sin modificar el esquema físico ni los datos seed).
 * [ ] `README.md`, `docs/CURRICULUM_SPEC.md`, `ECOMMERCE_TABLES_SCHEMA` (`api.ts`) y `ExerciseSpecPanel.tsx` están 100% sincronizados en nombres de tablas, columnas y conteos de filas, respaldados por una prueba automatizada contra divergencias.
@@ -749,9 +821,9 @@ Siguiendo la regla de flujo Git de [`AGENTS.md`](../../AGENTS.md) y el principio
 
 | Orden | Entregable | Rama Git Propuesta | Brechas Cubiertas | Verificación de Salida Obligatoria (Pendiente de Ejecución) |
 | :---: | :--- | :--- | :--- | :--- |
-| **1** | **PR-10.1: Protección de `solution_query`** | `fix/c01-protect-solution-query` | **`C-01`** | Pruebas `T-10.1-U1..U3`, `T-10.1-I1..I2`, `T-10.1-S1..S2`, `T-10.1-B1` y validación real de permisos en entorno Supabase de pruebas (`T-10.1-SB1`). |
-| **2** | **PR-10.2: Fuente Única de Persistencia** | `fix/c02-single-source-persistence` | **`C-02`** | Pruebas `T-10.2-U1..U2`, `T-10.2-I1`, `T-10.2-S1`, `T-10.2-B1` (cero escrituras directas no autorizadas, permitiendo lecturas legítimas) y `T-10.2-SB1`. |
-| **3** | **PR-10.3: Progreso por Ruta y Esquema Canónico** | `fix/c03-c04-track-progress-and-schema-sync` | **`C-03` + `C-04`** | Pruebas `T-10.3-U1..U3`, `T-10.3-I1` y `T-10.3-B1..B2` verificando cálculo determinista de rutas y sincronización con `ecommerce_seed.sql` (`pagos`, `metodo_pago`). |
+| **1** | **PR-10.1: Protección de `solution_query`** | `fix/c01-protect-solution-query` | **`C-01`** | Pruebas `T-10.1-U1..U3` (paridad en 7 atributos), `T-10.1-I1..I2`, `T-10.1-S1..S2`, `T-10.1-B1` y validación real de permisos en entorno Supabase de pruebas (`T-10.1-SB1`). |
+| **2** | **PR-10.2: Fuente Única de Persistencia y Migración D-05** | `fix/c02-single-source-persistence` | **`C-02` + `D-05`** | Pruebas `T-10.2-U1..U3` (candado y prevención de paralelas), `T-10.2-I1..I3` (recuperación de interrupciones, respuesta HTTP perdida, reintentos idempotentes), `T-10.2-S1`, `T-10.2-B1` y `T-10.2-SB1`. |
+| **3** | **PR-10.3: Progreso por Ruta y Esquema Canónico** | `fix/c03-c04-track-progress-and-schema-sync` | **`C-03` + `C-04`** | Pruebas `T-10.3-U1..U4` (aislamiento oficial vs invitado y skeleton loading), `T-10.3-I1` (inmunidad ante localStorage y `ex.is_completed`), `T-10.3-S1` y `T-10.3-B1..B2` (tablas canónicas y skeleton en UI). |
 | **4** | **PR-10.4: Routing, Deep Linking y Formatos Auth** | `feat/c05-url-routing-and-deep-linking` | **`C-05`** | Pruebas `T-10.4-U1`, `T-10.4-I1..I2` (con `pushState`/`popstate`), `T-10.4-B1` y `T-10.4-SB1` (flujos reales de Supabase Auth y espera de catálogo). |
 
 ---
@@ -761,22 +833,23 @@ Siguiendo la regla de flujo Git de [`AGENTS.md`](../../AGENTS.md) y el principio
 Para garantizar trazabilidad completa, todas las pruebas especificadas en las secciones 3.6, 4.6, 5.5, 6.4 y 7.4 se agrupan en las **5 categorías normativas** (ninguna de las pruebas de Fase 10 listadas abajo ha sido ejecutada aún):
 
 1. **Categoría 1 — Pruebas Unitarias (Ejecución local rápida sin red):**
-   * `T-10.1-U1` (DTOs públicos vs. internos sin `solution_query`), `T-10.1-U2` (métodos públicos vs. internos del repositorio), `T-10.1-U3` (paridad de fallback con fuente canónica).
-   * `T-10.2-U1` (propagación de campos de `record_verified_attempt` en `EvaluationResponse`), `T-10.2-U2` (filtrado de columnas visuales permitidas en `persistence.updateProfile`).
-   * `T-10.3-U1` (aislamiento de progreso por ruta), `T-10.3-U2` (casos borde: duplicados, inactivos, rutas vacías y `isLoading`), `T-10.3-U3` (detección automatizada de divergencias de esquema frente a `database/sandbox/ecommerce_seed.sql`).
+   * `T-10.1-U1` (DTOs públicos vs. internos sin `solution_query`), `T-10.1-U2` (métodos públicos vs. internos del repositorio), `T-10.1-U3` (sincronización estricta de la única fuente maestra `seed_data.py` con representaciones derivadas en los 7 atributos requeridos: IDs, títulos, módulos, dificultad, XP, orden y metadatos públicos).
+   * `T-10.2-U1` (propagación de campos de `record_verified_attempt` en `EvaluationResponse`), `T-10.2-U2` (filtrado de columnas visuales permitidas en `persistence.updateProfile`), `T-10.2-U3` (detección de candado obsoleto `syncing` $\to$ `pending` y deduplicación de cerradura `${user_id}:${exercise_id}`).
+   * `T-10.3-U1` (aislamiento estricto de `authoritativeCompletedIds`), `T-10.3-U2` (retorno de `null` y skeleton en `isLoading: true`), `T-10.3-U3` (detección automatizada de divergencias de esquema frente a `database/sandbox/ecommerce_seed.sql`), `T-10.3-U4` (separación total entre `computeOfficialTracksProgress` y `computeGuestTrialTracksProgress`).
    * `T-10.4-U1` (parser de rutas limpias, 404 y formatos reales de Supabase Auth en `hash` y `search`).
 2. **Categoría 2 — Pruebas de Integración (Coordinación entre módulos / API / Router):**
    * `T-10.1-I1` (endpoints `GET /exercises` y `GET /exercises/{id}` en modo online y fallback), `T-10.1-I2` (`POST /submit` evaluando con `ExerciseInternal` sin filtrar `solution_query`).
-   * `T-10.2-I1` (flujo `/submit` diferenciando usuario autenticado vs. invitado sin XP oficial).
-   * `T-10.3-I1` (prioridad de la fuente autorizada de intentos aprobados en usuarios autenticados).
+   * `T-10.2-I1` (flujo `/submit` diferenciando usuario autenticado vs. invitado sin XP oficial), `T-10.2-I2` (recuperación de interrupción post-recarga `F5` y tratamiento de respuesta HTTP perdida verificando estado remoto en Supabase antes de descartar), `T-10.2-I3` (sincronización parcial con reintento idempotente y `already_passed: true`).
+   * `T-10.3-I1` (manipulación simultánea de `localStorage` y `ex.is_completed = true` en catálogo para comprobar que ninguno incrementa el progreso oficial de usuarios autenticados).
    * `T-10.4-I1` (espera de carga del catálogo antes de evaluar 404 en `/exercises/:exerciseId`), `T-10.4-I2` (navegación con `history.pushState` y eventos `popstate` en sesiones autenticadas y no autenticadas).
 3. **Categoría 3 — Pruebas de Seguridad (Prevención de fugas de datos y escalación de privilegios):**
    * `T-10.1-S1` (inspección de código fuente, `.env*` y bundle compilado `apps/web/dist/` verificando cero exposición de `solution_query` y `SUPABASE_SERVICE_ROLE_KEY`), `T-10.1-S2` (verificación de `REVOKE SELECT` general + `GRANT SELECT` explícito por columna en el script SQL).
    * `T-10.2-S1` (inmunidad del progreso oficial y XP de usuarios autenticados ante adulteración manual de `localStorage`).
+   * `T-10.3-S1` (inmunidad del progreso oficial y certificados ante manipulación de `ex.is_completed = true` en memoria del cliente).
 4. **Categoría 4 — Pruebas de Navegador y Experiencia de Usuario (Browser / UX):**
    * `T-10.1-B1` (funcionamiento completo del IDE sin `solution_query` en respuestas de red).
    * `T-10.2-B1` (auditoría de red en navegador verificando cero escrituras directas no autorizadas a Supabase y permitiendo lecturas legítimas).
-   * `T-10.3-B1` (coherencia visual entre `TrackCard` y `ModuleAccordion`), `T-10.3-B2` (visualización de las 10 tablas reales incluyendo `pagos` y `metodo_pago` en la pestaña "Esquema" de `ExerciseSpecPanel`).
+   * `T-10.3-B1` (coherencia visual entre `TrackCard` y `ModuleAccordion`, y renderizado de skeleton en `isLoading` sin parpadear 0%), `T-10.3-B2` (visualización de las 10 tablas reales incluyendo `pagos` y `metodo_pago` en la pestaña "Esquema" de `ExerciseSpecPanel`).
    * `T-10.4-B1` (recarga `F5`, enlaces directos, botones nativos Atrás/Adelante y vista `404` con ruta real).
 5. **Categoría 5 — Pruebas contra un Entorno Supabase de Pruebas (Validación real de permisos y Auth):**
    * `T-10.1-SB1` (comprobación real contra PostgREST de que `anon` y `authenticated` reciben `42501 permission denied` al pedir `solution_query`, mientras `service_role` y las columnas públicas funcionan).
@@ -796,4 +869,4 @@ Conforme a la decisión aprobada **`D-07`**, ninguna funcionalidad de cobro (`D-
 
 ---
 
-*Fin del Plan de Estabilización de Fase 10 — `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md` v1.1*
+*Fin del Plan de Estabilización de Fase 10 — `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md` v1.2*
```

---

## 6. Estado y Próximos Pasos

1. **Estado Actual:**
   * La especificación técnica de la Fase 10 ha alcanzado el nivel de precisión, coherencia y rigor arquitectónico requerido en su versión **1.2**.
   * Tanto el Blueprint estratégico como el Plan de Estabilización están 100% sincronizados.
2. **Próximo Paso:**
   * **Detenerse de inmediato.**
   * Esperar la revisión y **autorización explícita del propietario del producto** antes de abrir la rama `fix/c01-protect-solution-query` o iniciar la implementación de `PR-10.1`.
