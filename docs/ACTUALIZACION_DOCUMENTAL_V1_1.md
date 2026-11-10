# Reporte de Actualización Documental — Qurio Blueprint v1.1 y Phase 10 Stabilization Plan v1.1

| Metadato | Detalle |
| :--- | :--- |
| **Fecha** | `10 de noviembre de 2026` |
| **Rama activa** | `docs/product-business-blueprint-v1` |
| **Tipo de tarea** | **Exclusivamente documental** (Cero cambios en código fuente, SQL, migraciones o infraestructura) |
| **Documento 1 actualizado** | [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`](./product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md) (Versión `1.1` revisada) |
| **Documento 2 actualizado** | [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](./roadmap/PHASE_10_STABILIZATION_PLAN.md) (Versión `1.1`) |

---

## 1. Documentos Actualizados

1. **Blueprint de Producto y Negocio (v1.1):** [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`](./product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md)
2. **Plan de Estabilización de Fase 10 (v1.1):** [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](./roadmap/PHASE_10_STABILIZATION_PLAN.md)

---

## 2. Resumen de Cambios por Documento

### 2.1 Cambios en `docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`

#### 1.1 Protección de soluciones de ejercicios (`C-01` — Secciones 2.2, 2.3, 8, 9.5 y 11.2)
* **Permisos en PostgreSQL / Supabase:** Se documentó que **no basta con revocar permisos a nivel de columna** (`REVOKE SELECT (solution_query)`) si continúa existiendo un permiso `SELECT` general sobre la tabla `public.exercises`. Se especificó la secuencia obligatoria:
  1. Revocar el permiso general sobre la tabla (`REVOKE SELECT ON public.exercises FROM PUBLIC, anon, authenticated;`).
  2. Conceder acceso explícito (`GRANT SELECT (...)`) únicamente a las columnas públicas necesarias (`id`, `module_id`, `title`, `prompt`, `initial_code`, `target_database`, `xp_reward`, `difficulty`, `check_order`, `sort_order`, `created_at`), excluyendo `solution_query`.
* **Exclusividad en Backend y encapsulamiento de `service_role`:** Las soluciones permanecen disponibles únicamente en el backend (`ExerciseInternal`). El cliente con `service_role` (`SUPABASE_SERVICE_ROLE_KEY`) queda estrictamente encapsulado en el backend FastAPI y nunca se expone al navegador, variables `VITE_*`, logs ni bundles del frontend.
* **Sincronización del fallback en memoria con la fuente canónica:** Se definió que `EXERCISES_SEED` (`apps/api/app/modules/curriculum/seed_data.py`) y `database/supabase/02_seed_curriculum.sql` actúan como fuente canónica; el fallback del backend proyecta a `ExercisePublicDTO` en lecturas públicas y el fallback del frontend (`FALLBACK_EXERCISES` en `apps/web/src/lib/api.ts`) omite `solution_query`, verificando su sincronización mediante pruebas automatizadas de paridad.
* **Pruebas anti-filtración:** Se incluyeron requisitos de pruebas sobre endpoints, respuestas API, DTOs, repositorio, bundles compilados del frontend y permisos reales de base de datos.

#### 1.2 Arquitectura de ejecución Python (`D-04` — Secciones 9.2, 9.5, 9.6 y 11.2)
* **Separación estricta de responsabilidades:**
  * El **worker aislado** es responsable únicamente de ejecutar el código Python y devolver la salida cruda.
  * El worker **no dispone de credenciales de Supabase** (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`, cadenas de conexión) **ni permisos para leer o modificar datos de usuarios**.
  * **FastAPI** valida la solicitud (JWT, *rate limiting*, *entitlements*), coordina la ejecución con el worker y conserva el 100% de la autoridad sobre la evaluación semántica y la persistencia.
  * **FastAPI** es el único componente que invoca la RPC correspondiente (`public.record_verified_attempt`) cuando se confirma un intento válido.
* **Alternativas abiertas a evaluación:** Se mantuvieron **contenedores efímeros en servidor (Alternativa A)**, **Pyodide/WASM en navegador (Alternativa B)** y **arquitectura híbrida (Alternativa C)** como alternativas por evaluar, sin seleccionar ni implementar una solución definitiva sin una evaluación técnica documentada previa.

#### 1.3 Migración de usuarios invitados (`D-05` — Secciones 6.5 y 11.2)
* **Mecanismo seguro, resiliente e idempotente (`qurio_guest_progress_v1`):**
  * Conserva el progreso temporal del usuario invitado (hasta 3 ejercicios) durante el flujo de registro, confirmación e inicio de sesión.
  * Evita duplicaciones al reintentar la migración mediante control de estado por ítem en cliente (`sync_status: 'pending' | 'syncing'`) e idempotencia transaccional en el backend/base de datos (`record_verified_attempt` e índice único parcial `idx_single_awarded_passed_attempt`).
  * Permite **sincronización parcial**: cada ejercicio se re-valida y confirma individualmente.
  * Conserva los elementos pendientes en `localStorage` si ocurre un error de red, *rate limit* o servidor.
  * Limpia los datos locales **únicamente después de confirmar que la persistencia remota fue exitosa**.
  * Se eliminó la promesa de rendimiento no verificada de sincronización en `< 100 ms`.

#### 1.4 Rutas y referencias documentales
* Se sustituyeron todas las rutas absolutas locales (`../...`) por rutas relativas al repositorio (`../roadmap/PHASE_10_STABILIZATION_PLAN.md`, `../../apps/...`, `../../database/...`, `../../AGENTS.md`, `../../README.md`) y se verificó la consistencia de todas las referencias internas.

#### 1.5 Estado del documento (Encabezado, Alcance y Sección 11.2)
* El encabezado y la sección de alcance distinguen explícitamente entre:
  1. **Decisiones `D-01` a `D-07`:** Aprobadas por el propietario del producto.
  2. **Cuerpo del documento:** Propuesta estratégica y arquitectónica documentada.
  3. **Validación final del documento completo:** Pendiente (no se declara el producto completo aprobado únicamente porque las siete decisiones hayan sido aceptadas).

---

### 2.2 Cambios en `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md` (Versión `1.1`)

Se actualizó el documento a la **versión `1.1`**, conservando su estructura general, los cuatro entregables (`PR-10.1` a `PR-10.4`) y la secuencia de trabajo propuesta:

#### PR-10.1 — `C-01`: Protección de `solution_query` (Sección 3)
* Separación estricta entre `ExercisePublicDTO` y `ExerciseInternal`.
* Acceso a soluciones y uso de `SUPABASE_SERVICE_ROLE_KEY` restringidos exclusivamente al backend; prohibición total de exponer variables privilegiadas en el frontend (`VITE_*`, logs o bundles).
* Revocación del permiso `SELECT` general en `public.exercises` y concesión explícita por columna pública.
* Sincronización del fallback en memoria con la fuente canónica (`seed_data.py` / `02_seed_curriculum.sql`).
* Incorporación de pruebas de endpoints, DTO, repositorio, bundles compilados y permisos SQL, distinguiendo explícitamente entre **pruebas locales** (`T-10.1-U1..U3`, `T-10.1-I1..I2`, `T-10.1-S1..S2`, `T-10.1-B1`) y **validación real de permisos en un entorno Supabase de pruebas** (`T-10.1-SB1`).

#### PR-10.2 — `C-02`: Fuente única de persistencia (Sección 4)
* **Usuarios autenticados:** El backend es la fuente autoritativa del progreso oficial; `localStorage` funciona solo como caché temporal y jamás autoriza la aprobación oficial de ejercicios ni la concesión de XP; `EvaluationResponse` propaga `xp_earned`, `total_xp`, `level` y `already_passed` devueltos por `record_verified_attempt()`; el frontend no escribe directamente en tablas de intentos, XP, niveles ni actividad oficial; **no se modifica la RPC `record_verified_attempt()` existente**.
* **Usuarios invitados:** El progreso se mantiene temporalmente en el navegador sin otorgar XP oficial ni progreso persistente oficial; se documentó una matriz comparativa entre progreso invitado y progreso autenticado.
* **Criterios de aceptación ajustados:** Se exigen **cero escrituras directas no autorizadas desde el navegador**, permitiendo las lecturas HTTP legítimas (`GET`) y la actualización autorizada de campos visuales del perfil (`display_name`, `avatar_url`, `bio`).
* **Alcance local documentado:** Se documentó que los logros (`user_achievements`) y la actividad diaria (`user_daily_activity`) que permanezcan exclusivamente en `localStorage` no se sincronizan entre dispositivos.

#### PR-10.3 — `C-03` y `C-04`: Progreso y esquema (Secciones 5 y 6)
* **Para `C-03`:** `computeTracksProgress` filtra ejercicios activos y excluidos (`is_active`, `is_archived`), evita duplicaciones con conjuntos `Set<string>`, contempla rutas vacías (`0 / 0` sin `NaN`), carga parcial y estados de carga (`isLoading: true`), y utiliza una fuente autorizada para los IDs completados de usuarios autenticados.
* **Para `C-04`:** Se definió `database/sandbox/ecommerce_seed.sql` como fuente canónica manteniendo la tabla `pagos` (`11` filas) y la columna `metodo_pago`; se especificó la sincronización de documentación (`README.md`, `docs/CURRICULUM_SPEC.md`), nombres de tablas, columnas, conteos y componentes visuales (`api.ts`, `ExerciseSpecPanel.tsx`); se añadió la prueba automatizada `T-10.3-U3` contra futuras divergencias y se dejó asentado que no se modifica el esquema físico ni los datos seed.

#### PR-10.4 — `C-05`: Routing y deep linking (Sección 7)
* Preservación de todos los formatos reales de autenticación de Supabase (fragmentos `#access_token=...&type=recovery|signup`, query params PKCE `?code=...`, `?token_hash=...`, eventos `onAuthStateChange` como `PASSWORD_RECOVERY` y rutas `/auth/confirm`, `/auth/reset-password`) sin asumir que basta con buscar una subcadena fija en el hash.
* Al abrir `/exercises/:exerciseId` (o `/tracks/:trackId`), espera obligatoria a que el catálogo esté cargado (`isLoadingCatalog === false`) antes de determinar que el recurso no existe (`404`).
* Las pruebas automatizadas utilizan `window.history.pushState`, eventos `popstate` o herramientas del router, prohibiendo depender de asignaciones directas a `window.location.pathname`.
* Especificación de configuración SPA según el proveedor de hosting y cobertura de recarga (`F5`), navegación atrás/adelante, enlaces directos, rutas inexistentes y sesiones autenticadas/no autenticadas.

#### Calidad y Clasificación de Pruebas (Secciones 3.6, 4.6, 5.5, 6.4, 7.4 y 8.3)
* Todas las pruebas quedaron clasificadas en las 5 categorías exigidas:
  1. **Pruebas unitarias** (`T-10.1-U1..U3`, `T-10.2-U1..U2`, `T-10.3-U1..U3`, `T-10.4-U1`).
  2. **Pruebas de integración** (`T-10.1-I1..I2`, `T-10.2-I1`, `T-10.3-I1`, `T-10.4-I1..I2`).
  3. **Pruebas de seguridad** (`T-10.1-S1..S2`, `T-10.2-S1`).
  4. **Pruebas de navegador y experiencia de usuario** (`T-10.1-B1`, `T-10.2-B1`, `T-10.3-B1..B2`, `T-10.4-B1`).
  5. **Pruebas contra un entorno Supabase de pruebas** (`T-10.1-SB1`, `T-10.2-SB1`, `T-10.4-SB1`).
* Cada prueba especifica: **Comportamiento verificado**, **Resultado observable esperado**, **Condición de aprobación/fallo (Pass/Fail)**, **Entorno requerido** y **Limitaciones**, indicando explícitamente que ninguna de estas pruebas nuevas de Fase 10 ha sido ejecutada todavía.

---

## 3. Diffs de Ambos Documentos

### 3.1 Diff de `docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`

```diff
--- a/docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md (v1.1 previa)
+++ b/docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md (v1.1 revisada)
@@ -3,28 +3,33 @@
 | Metadato | Detalle |
 | :--- | :--- |
 | **Documento** | `docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` |
 | **Versión** | `1.1` |
-| **Fecha de elaboración** | `9 de noviembre de 2026` |
-| **Estado** | **Estrategia v1.1 Aprobada — En planificación de Fase 10 (Estabilización Técnica)** |
+| **Fecha de actualización** | `10 de noviembre de 2026` |
+| **Estado de Decisiones (`D-01` a `D-07`)** | **Aprobadas por el propietario del producto** |
+| **Estado del Documento** | **Propuesta estratégica y arquitectónica documentada — Validación final del documento completo pendiente** |
 | **Repositorio de referencia** | [`https://github.com/ErickKNT/qurio`](https://github.com/ErickKNT/qurio) |
-| **Plan técnico vinculado** | [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](roadmap/PHASE_10_STABILIZATION_PLAN.md) |
+| **Plan técnico vinculado** | [`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](../roadmap/PHASE_10_STABILIZATION_PLAN.md) (v1.1) |
...
-## Alcance del Documento
+## Alcance y Estado de Gobernanza del Documento
+Para total claridad de gobernanza, este documento distingue explícitamente tres niveles de estado:
+1. **Decisiones `D-01` a `D-07` aprobadas por el propietario del producto:** ...
+2. **Propuesta estratégica, curricular y arquitectónica documentada:** ...
+3. **Validación final del documento completo y del producto pendiente:** La aceptación de las decisiones `D-01` a `D-07` **no equivale a declarar que el producto completo, sus precios o su arquitectura futura están cerrados o aprobados en su totalidad**.
...
+### 2.3 Especificación de Seguridad para la Protección de Soluciones (`C-01`)
+1. **Mecánica de Privilegios en PostgreSQL / Supabase (Revocación de Permiso General + Concesión Explícita por Columna):**
+   * En PostgreSQL, **no basta con ejecutar `REVOKE SELECT (solution_query)` a nivel de columna si continúa existiendo un permiso `SELECT` general concedido sobre la tabla completa**...
+   * Por tanto, la política de base de datos debe obligatoriamente: (1) Revocar el permiso `SELECT` general sobre `public.exercises` (`REVOKE SELECT ON public.exercises FROM PUBLIC, anon, authenticated;`), y (2) Conceder explícitamente `GRANT SELECT (...)` únicamente sobre la lista blanca de columnas públicas necesarias.
+2. **Disponibilidad Exclusiva de las Soluciones en el Backend:** `ExerciseInternal` exclusivo del servidor vs. `ExercisePublicDTO`.
+3. **Encapsulamiento Estricto del Cliente con `service_role`:** Nunca expuesto al navegador, variables `VITE_*`, logs ni bundles del frontend.
+4. **Sincronización del Fallback en Memoria con la Fuente Canónica de Ejercicios:** Paridad verificada entre `seed_data.py`, `02_seed_curriculum.sql` y `FALLBACK_EXERCISES` (sin `solution_query`).
+5. **Requisitos de Pruebas Anti-Filtración:** Endpoints, DTOs/repositorio, código/bundles compilados y permisos reales en base de datos.
...
 ### 6.5 Arquitectura de la Experiencia de Invitados (Decisión Aprobada `D-05`)
-  3. El backend re-ejecuta y valida semánticamente cada una de las hasta 3 consultas en menos de 100 ms y llama a la RPC `public.record_verified_attempt` con `service_role`.
-  5. Una vez sincronizados, el cliente limpia `qurio_guest_progress_v1` de `localStorage`.
+* **Protocolo de Migración por Re-Verificación Autoritativa e Idempotente (*Replay, Verify & Confirm per Item*):**
+  1. **Conservación durante el flujo de registro:** `qurio_guest_progress_v1` se conserva durante `signUp`, confirmación e inicio de sesión.
+  2. **Prevención de duplicaciones ante reintentos:** Candado en cliente (`sync_status: 'syncing'`) + idempotencia transaccional en servidor (`record_verified_attempt` e índice `idx_single_awarded_passed_attempt`).
+  3. **Soporte de sincronización parcial y conservación de pendientes ante errores:** Si los ejercicios #1 y #2 se persisten pero el #3 falla, #1 y #2 quedan acreditados y #3 se conserva como `'pending'` en `localStorage`.
+  4. **Limpieza condicional estricta tras confirmación remota:** Solo se eliminan los datos locales después de confirmar que la persistencia remota en Supabase fue exitosa.
+  5. **Sin promesas de latencia no verificadas:** Se elimina cualquier garantía de sincronización `< 100 ms`.
...
 ### 9.6 Decisión Arquitectónica Independiente: Motor de Ejecución de Python (Decisión Aprobada `D-04`)
+#### 1. Separación Estricta de Responsabilidades (Invariante Obligatorio para Cualquier Alternativa)
+1. **Responsabilidad exclusiva del Worker Aislado:** Ejecuta únicamente el código Python; **jamás dispone de credenciales de Supabase ni permisos para modificar datos de usuarios**.
+2. **Responsabilidad y Autoridad Exclusiva de FastAPI:** Valida la solicitud, coordina la ejecución, conserva la autoridad sobre la evaluación y la persistencia, e invoca la RPC `public.record_verified_attempt` cuando se confirma un intento válido.
+#### 2. Alternativas Arquitectónicas por Evaluar
+* Se mantienen Contenedores Efímeros (Alternativa A), Pyodide/WASM (Alternativa B) y Arquitectura Híbrida (Alternativa C) como alternativas sujetas a evaluación técnica documentada, sin seleccionar ni implementar aún una solución definitiva.
```

---

### 3.2 Diff de `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`

```diff
--- a/docs/roadmap/PHASE_10_STABILIZATION_PLAN.md (v1.0)
+++ b/docs/roadmap/PHASE_10_STABILIZATION_PLAN.md (v1.1)
@@ -3,10 +3,10 @@
 | Metadato | Detalle |
 | :--- | :--- |
 | **Documento** | `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md` |
-| **Versión** | `1.0` |
-| **Fecha de elaboración** | `9 de noviembre de 2026` |
-| **Estado** | **Diagnóstico forense completado — Planificado para ejecución (Código sin modificar)** |
-| **Documento rector vinculado** | [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` (v1.1)](product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md) |
+| **Versión** | `1.1` |
+| **Fecha de actualización** | `10 de noviembre de 2026` |
+| **Estado** | **Diagnóstico forense y especificación v1.1 completados — Planificado para ejecución (Código e infraestructura sin modificar)** |
+| **Documento rector vinculado** | [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` (v1.1)](../product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md) |
...
+## 3. Especificación Técnica de `C-01` (`PR-10.1`): Protección Estricta de `solution_query`
+* **Encapsulamiento estricto de `SUPABASE_SERVICE_ROLE_KEY`:** Limitado al backend; cero variables privilegiadas en `VITE_*`, logs o bundles del frontend.
+* **Por qué no basta revocar permisos de columna aislados en PostgreSQL:** Se documenta `REVOKE SELECT ON public.exercises FROM PUBLIC, anon, authenticated;` seguido de `GRANT SELECT (...)` explícito solo sobre las columnas públicas necesarias.
+* **Sincronización del Fallback en Memoria con la Fuente Canónica:** `EXERCISES_SEED` -> `.to_public_dto()` en backend y `FALLBACK_EXERCISES` sin `solution_query` en frontend validado con prueba de paridad.
+* **3.6 Especificación Verificable de Pruebas (`T-10.1-U1..U3`, `T-10.1-I1..I2`, `T-10.1-S1..S2`, `T-10.1-B1`, `T-10.1-SB1`):** Distinción explícita entre pruebas locales y validación real contra PostgREST en un entorno Supabase de pruebas.
...
+## 4. Especificación Técnica de `C-02` (`PR-10.2`): Fuente Única de Persistencia y Contrato Autoritativo
+### 4.3 Reglas de Autoridad: Usuarios Autenticados vs. Usuarios Invitados
+* **Usuarios Autenticados:** Backend única fuente autoritativa; `localStorage` nunca autoriza aprobación ni XP; `EvaluationResponse` propaga `xp_earned`, `total_xp`, `level` y `already_passed` desde `record_verified_attempt()` sin modificar la RPC existente; cero escrituras directas a tablas de intentos, XP, niveles o actividad oficial.
+* **Usuarios Invitados:** Progreso temporal en navegador sin otorgar XP oficial ni persistencia oficial.
+* **Limitación documentada:** Logros (`user_achievements`) y actividad diaria (`user_daily_activity`) que permanecen solo en `localStorage` no se sincronizan entre dispositivos.
+* **Criterio ajustado:** Cero escrituras directas no autorizadas desde el navegador (permitiendo lecturas HTTP `GET` legítimas y edición visual de `display_name`, `avatar_url`, `bio`).
...
+## 5. Especificación Técnica de `C-03` (`PR-10.3a`) y ## 6. `C-04` (`PR-10.3b`)
+* `computeTracksProgress(tracks, exercises, authoritativeCompletedIds, { isLoading })`: Filtra ejercicios activos y excluidos (`is_active`, `is_archived`), deduplica IDs, contempla rutas vacías (`0/0` sin `NaN`), carga parcial y estados `isLoading`, y usa la fuente autorizada para usuarios autenticados.
+* `C-04`: Define `database/sandbox/ecommerce_seed.sql` como fuente canónica (manteniendo tabla `pagos` y columna `metodo_pago`) sin modificar el esquema físico ni los datos seed, e incorpora `T-10.3-U3` para detectar divergencias futuras.
...
+## 7. Especificación Técnica de `C-05` (`PR-10.4`): Arquitectura de Navegación Web, Routing y Deep Linking
+* **1. Preservación Integral de los Formatos Reales de Autenticación de Supabase:** Soportando fragmentos `#access_token=...&type=recovery|signup`, query params PKCE `?code=...`, `?token_hash=...&type=...`, eventos `onAuthStateChange` (`PASSWORD_RECOVERY`) y rutas dedicadas, sin depender solo de buscar una subcadena fija en `window.location.hash`.
+* **2. Hidratación Segura del Catálogo en `/exercises/:exerciseId`:** Espera a `isLoadingCatalog === false` antes de determinar si un recurso no existe (`404`).
+* **5. Configuración SPA para el Proveedor de Hosting:** Reglas para Vercel/Netlify/Cloudflare/Nginx y requisito de incluir el archivo correspondiente al proveedor real.
+* **7.4 Pruebas (`T-10.4-U1`, `T-10.4-I1..I2`, `T-10.4-B1`, `T-10.4-SB1`):** Uso estricto de `window.history.pushState` y `PopStateEvent('popstate')` (sin asignaciones directas a `window.location.pathname`).
```

---

## 4. Estado de Git Antes y Después

### `git status` antes de la tarea:
```text
On branch docs/product-business-blueprint-v1
Changes not staged for commit:
	modified:   docs/BITACORA.md

Untracked files:
	docs/product/
	docs/roadmap/
```

### `git status` después de la tarea:
```text
On branch docs/product-business-blueprint-v1
Changes not staged for commit:
	modified:   docs/BITACORA.md

Untracked files:
	docs/ACTUALIZACION_DOCUMENTAL_V1_1.md
	docs/product/
	docs/roadmap/
```

---

## 5. Observaciones Pendientes de Información Externa al Repositorio

1. **Proveedor de hosting definitivo para el archivo de configuración SPA (`PR-10.4` / `C-05`):**
   * En el repositorio actual existen `apps/web/vite.config.ts` y `docker-compose.yml`, pero no existe aún un archivo de configuración de proveedor de hosting de producción (`vercel.json`, `netlify.toml`, `public/_redirects` o `nginx.conf`).
   * En `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md` (Sección 7.3.5) se dejaron especificadas las reglas exactas para cada proveedor (Vercel, Netlify/Cloudflare Pages y Nginx) y el requisito de confirmar con el propietario del producto cuál es el proveedor elegido antes de ejecutar `PR-10.4`.
2. **Ubicación de `PHASE_10_STABILIZATION_PLAN.md`:**
   * Dentro del árbol del repositorio, el archivo se ubica en `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`. Todas las referencias cruzadas relativas entre `docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md` y `docs/roadmap/PHASE_10_STABILIZATION_PLAN.md` fueron verificadas y sincronizadas.

---

## 6. Confirmación Explícita de Cumplimiento de Restricciones

Se confirma explícitamente que durante esta tarea:
* **NO** se modificaron archivos de código fuente (`apps/web/`, `apps/api/`).
* **NO** se modificaron archivos SQL ni migraciones (`database/sandbox/`, `database/supabase/`).
* **NO** se ejecutaron migraciones.
* **NO** se modificó Supabase Cloud (ni políticas RLS, ni privilegios CLS, ni RPC, ni configuración de producción).
* **NO** se implementaron pagos ni se integró Stripe.
* **NO** se implementó el runner de Python.
* **NO** se crearon endpoints nuevos ni se modificaron variables de entorno.
* **NO** se realizaron despliegues, merges, cambios en `main`, ni se inició `PR-10.1` o ningún otro PR.
