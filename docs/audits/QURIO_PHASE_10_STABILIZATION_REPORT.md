# Qurio — Informe Integral de Estabilización de Fase 10 y Cierre de Línea Base Operativa

| Metadato | Detalle |
| :--- | :--- |
| **Identificador del Documento** | `QURIO-PHASE-10-STABILIZATION-REPORT` |
| **Identificador de Tarea** | `QURIO-OPERATIONAL-BASELINE-02` |
| **Fecha de Finalización** | 10 de noviembre de 2026 |
| **Rama de Trabajo** | [`feat/phase-10-stabilization`](https://github.com/ErickKNT/qurio/tree/feat/phase-10-stabilization) |
| **Commit Base de Rama** | `3d747bf` (ramificada desde `docs/operational-baseline-v1` y `main` en `add8b6d`) |
| **Commit de Cierre** | `32d1c80` (*feat(phase-10): complete stabilization and close operational baseline (C-01 to C-05)*) |
| **Repositorio Remoto** | `https://github.com/ErickKNT/qurio.git` (sincronizada y actualizada en `origin`) |
| **Estado de Verificación** | **100% Ejecutable y Automatizado (69 tests Backend + 8 tests Frontend + Build Limpio)** |
| **Documentos Rectores Vinculados** | [`docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md`](file:///c:/Desarrollo/Qurio/docs/product/QURIO_PRODUCT_BUSINESS_BLUEPRINT.md) (v1.2)<br>[`docs/roadmap/PHASE_10_STABILIZATION_PLAN.md`](file:///c:/Desarrollo/Qurio/docs/roadmap/PHASE_10_STABILIZATION_PLAN.md) (v1.2)<br>[`docs/audits/QURIO_OPERATIONAL_AUDIT.md`](file:///c:/Desarrollo/Qurio/docs/audits/QURIO_OPERATIONAL_AUDIT.md) (v1.1)<br>[`docs/roadmap/QURIO_OPERATIONAL_BASELINE.md`](file:///c:/Desarrollo/Qurio/docs/roadmap/QURIO_OPERATIONAL_BASELINE.md) (v1.1)<br>[`docs/BITACORA.md`](file:///c:/Desarrollo/Qurio/docs/BITACORA.md) (Entrada 24) |

---

## 1. Resumen Ejecutivo y Declaración de Intención

Tras la conclusión de la auditoría forense (`QURIO-OPERATIONAL-BASELINE-01`), se identificó que Qurio poseía una arquitectura conceptual sólida y un catálogo curricular completo de 50 retos, pero sufría de **5 brechas técnicas críticas (`C-01` a `C-05`)** que impedían abrir la plataforma a estudiantes reales sin comprometer la integridad académica, distorsionar las métricas de avance o provocar fallos silenciosos de permisos en el navegador.

Bajo la directriz ejecutiva de **avanzar mediante entregables funcionales completos sin dejar problemas sin resolver ni fragmentar artificialmente el trabajo**, la tarea `QURIO-OPERATIONAL-BASELINE-02` abordó, implementó y certificó con pruebas automatizadas la totalidad de las remediaciones técnicas necesarias:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MAPA DE ESTABILIZACIÓN — FASE 10 EJECUTADA                     │
├─────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ BLOQUE A: SEGURIDAD     │ BLOQUE B: PERSISTENCIA   │ BLOQUE C: PROGRESO Y ESQUEMA      │
│ CURRICULAR (C-01)       │ E INVITADOS (C-02, D-05) │ (C-03, C-04)                      │
│ • ExercisePublicDTO     │ • Supresión writes 42501 │ • computeOfficialTracksProgress   │
│ • DTOs públicos FastAPI │ • Trial 3 retos (HTTP401)│ • Aislamiento estricto de rutas   │
│ • 0 solution_query en   │ • qurio_guest_progress_v1│ • Shimmer skeleton en isLoading   │
│   dist/assets/*.js      │ • Desbloqueo stale > 30s │ • 10 tablas visibles en IDE       │
│ • Evaluador reservado   │ • syncGuestProgress idemp│ • Conteos reales ecommerce_seed   │
├─────────────────────────┴──────────────────────────┴───────────────────────────────────┤
│ BLOQUE D: ENRUTAMIENTO WEB Y NAVEGACIÓN REAL (C-05)                                    │
│ • History API nativa: URLs /exercises/:id, /tracks/:slug, /playground, /profile       │
│ • Preservación absoluta del estado del editor ante recargas del navegador (F5)         │
│ • Navegación fluida del historial (Atrás / Adelante con popstate)                      │
│ • Detección y saneamiento de parámetros Supabase Auth (PKCE code, token_hash, recovery)│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Implementación Detallada por Bloque Funcional

### 2.1 Bloque A — Seguridad Curricular (`C-01`): Protección Absoluta de `solution_query`

#### 2.1.1 Diagnóstico de la Brecha
La auditoría forense reveló que `solution_query` se encontraba expuesta en texto plano en 50 puntos del código estático compilado del frontend (`dist/assets/index-*.js`), en el catálogo offline `FALLBACK_EXERCISES` de `api.ts`, en la interfaz TypeScript `Exercise` y en las respuestas JSON serializadas por los endpoints `GET /api/v1/exercises` y `GET /api/v1/exercises/{exercise_id}` de FastAPI. Cualquier usuario con conocimientos básicos de herramientas de desarrollador (`F12`) podía extraer las soluciones oficiales y superar los 50 retos sin escribir código.

#### 2.1.2 Solución Arquitectónica en Backend (`apps/api/`)
1. **Separación de DTOs en [`seed_data.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/curriculum/seed_data.py):**
   * Se creó la clase `ExercisePublicDTO` conteniendo únicamente las propiedades formativas necesarias para el estudiante (`id`, `module_id`, `title`, `prompt`, `initial_code`, `xp_reward`, `difficulty`, `check_order`, `sort_order`, `hints`, `concept`, `objectives`, `sample_tables`).
   * Se excluyó de forma estricta el campo `solution_query`.
   * Se dotó a `ExerciseDetail` del método de transformación `.to_public_dto() -> ExercisePublicDTO`.
2. **Desacoplamiento de Acceso en [`repository.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/curriculum/repository.py):**
   * Se crearon los métodos `list_public() -> List[ExercisePublicDTO]` y `get_public_by_id(exercise_id: str) -> Optional[ExercisePublicDTO]`, los cuales proyectan únicamente DTOs protegidos.
   * Se creó `get_internal_for_evaluation(exercise_id: str) -> Optional[ExerciseDetail]` para uso exclusivo del evaluador semántico interno (`submit_exercise_solution`).
3. **Restricción de Endpoints en [`router.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/router.py):**
   * `GET /api/v1/exercises` cambió su `response_model` a `List[ExercisePublicDTO]`.
   * `GET /api/v1/exercises/{exercise_id}` cambió su `response_model` a `ExercisePublicDTO`.
   * `POST /api/v1/exercises/{exercise_id}/submit` consume `get_internal_for_evaluation()` en el servidor para ejecutar la consulta de referencia contra el sandbox Docker sin exponerla al cliente en ningún momento.

#### 2.1.3 Solución en Frontend (`apps/web/`)
1. **Tipado Estricto en [`types/index.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/types/index.ts):**
   * Se eliminó definitivamente la propiedad `solution_query?: string` de la interfaz `Exercise`.
2. **Purga del Catálogo Offline en [`api.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/api.ts):**
   * Se purgaron las 50 líneas que declaraban `solution_query: "..."` en `FALLBACK_EXERCISES`.
3. **Verificación de Empaquetado:**
   * La ejecución de `npm run build` produjo un bundle en `dist/assets/*.js` donde la búsqueda de `solution_query` devolvió **0 resultados**.

#### 2.1.4 Modelo de Permisos de PostgreSQL / Supabase Cloud
Se documentó y estructuró la política de seguridad a nivel base de datos:
* No basta con revocar permisos a nivel de columna si existe un permiso `SELECT` general en la tabla.
* Se estructuró la revocación:
  ```sql
  REVOKE SELECT ON public.exercises FROM anon, authenticated;
  GRANT SELECT (id, module_id, title, prompt, initial_code, xp_reward, difficulty, check_order, sort_order, hints, concept, objectives, sample_tables)
  ON public.exercises TO anon, authenticated;
  ```
* La columna `solution_query` permanece accesible **únicamente para el rol `service_role`**, el cual reside exclusivamente en el backend FastAPI y nunca se transfiere a variables `VITE_*` ni a bundles cliente.

---

### 2.2 Bloque B — Persistencia y Experiencia de Usuario Autenticado e Invitado (`C-02` + `D-05`)

#### 2.2.1 Diagnóstico de la Brecha
El backend FastAPI ya persistía autoritativamente los intentos mediante la RPC segura `record_verified_attempt`. Sin embargo, el cliente frontend (`persistence.ts`) contenía código residual que intentaba escribir directamente mediante el SDK de Supabase:
* `.from('exercise_attempts').insert(...)`
* `.from('user_profiles').update({ xp: newXp, level: newLevel })`
* `.from('user_daily_activity').update(...)`

Dado que el hardening de seguridad (Fase 9) revocó con éxito los privilegios de escritura directa sobre esas tablas y columnas para el rol `authenticated`, PostgreSQL rechazaba cada una de estas peticiones con error `42501 (insufficient privilege)`. En `persistence.ts`, estos errores eran capturados silenciosamente con `console.warn`, pero generaban ruido en consola y bloqueaban funciones legítimas del usuario como actualizar su nombre o avatar en `updateProfile()`.

#### 2.2.2 Remediación en Frontend ([`persistence.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/persistence.ts))
1. **Eliminación Total de Mutaciones Directas:**
   * Se suprimieron todas las operaciones `.insert()` y `.update()` directas a `exercise_attempts`, `user_profiles` y `user_daily_activity`.
   * El cliente asume al backend como la única autoridad certificadora de progreso.
2. **Blindaje de `updateProfile()`:**
   * La función filtra exhaustivamente el payload y restringe las mutaciones permitidas exclusivamente a:
     * `display_name` (o `full_name`)
     * `avatar_url`
     * `username`
   * Si el objeto contiene `total_xp` o `current_level`, estos valores son guardados únicamente en la copia de respaldo local (`qurio_user_profile`) para renderizado visual temporal, pero **jamás se envían a Supabase**, eliminando el error `42501`.
3. **Aislamiento Estricto de la Fuente de Progreso:**
   * `getCompletedExerciseIds(userId)` para usuarios autenticados consulta exclusivamente `exercise_attempts` en Supabase Cloud.
   * Se eliminó la línea `const merged = new Set([...localCompleted, ...cloudIds])`, garantizando que ningún dato manipulado en `localStorage` pueda inflar el progreso oficial de una cuenta.

#### 2.2.3 Límite de Prueba de Invitados en Backend ([`router.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/router.py))
* En el endpoint `POST /api/v1/exercises/{exercise_id}/submit`:
  ```python
  GUEST_TRIAL_EXERCISE_IDS = {
      "e0000000-0000-0000-0000-000000000001",
      "e0000000-0000-0000-0000-000000000002",
      "e0000000-0000-0000-0000-000000000003",
      "ex-m01-01", "ex-m01-02", "ex-m01-03",
  }
  if user.is_guest and exercise_id not in GUEST_TRIAL_EXERCISE_IDS:
      raise HTTPException(
          status_code=status.HTTP_401_UNAUTHORIZED,
          detail="REGISTRATION_REQUIRED_AFTER_TRIAL: Debes crear una cuenta o iniciar sesión para continuar practicando después de los 3 ejercicios de prueba.",
      )
  ```

#### 2.2.4 Protocolo de Migración de Invitados y Recuperación de Interrupciones (`D-05`)
1. **Almacén Temporal de Invitados (`qurio_guest_progress_v1`):**
   * Estructura: `{ exercise_id, submitted_sql, hints_used, passed_at, sync_status: 'pending' | 'syncing' | 'synced', sync_started_at?: number }`.
2. **Recuperación de Sincronizaciones Interrumpidas (`recoverInterruptedGuestSync`):**
   * Si el usuario cierra el navegador o recarga la página mientras un ejercicio está en vuelo (`sync_status === 'syncing'`), el elemento podía quedar bloqueado permanentemente.
   * La función comprueba: si `sync_status === 'syncing'` y `Date.now() - sync_started_at > 30000` (más de 30 segundos), el elemento es restaurado automáticamente a `'pending'` con `sync_started_at = undefined`.
3. **Migración Idempotente (`syncGuestProgress`):**
   * Al iniciar sesión (`onAuthStateChange` con evento `SIGNED_IN` en [`useAuth.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/hooks/useAuth.tsx)):
     1. Ejecuta primero `recoverInterruptedGuestSync()`.
     2. Consulta la lista oficial de ejercicios completados en la nube (`cloudPassedSet`).
     3. Si el ejercicio del invitado ya fue superado previamente en la cuenta de usuario, se marca `'synced'` de inmediato sin realizar peticiones de red innecesarias.
     4. Para retos no presentes en la nube, se envía la evaluación mediante `api.submitSolution(...)` adjuntando el JWT autenticado del usuario.
     5. Una vez confirmado el éxito, se purga del almacenamiento local de invitados.

---

### 2.3 Bloque C — Integridad del Currículo y Progreso (`C-03` + `C-04`)

#### 2.3.1 Diagnóstico de la Brecha
* En [`App.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/App.tsx) línea 129: al cargar los ejercicios completados, se ejecutaba `setTracks(prev => prev.map(tr => ({ ...tr, completed_exercises: completedIds.length })))`. Si un alumno completaba 5 retos de la Ruta 1, las Rutas 2 y 3 mostraban erróneamente 5 retos completados.
* En `handleExecuteSolution`: al resolver cualquier reto, se sumaba `+1` a todas las rutas indiscriminadamente.
* En `TrackCard.tsx`: mientras se sincronizaba con la red, se mostraba `0%` por defecto en lugar de un estado de carga visual.
* En `ExerciseSpecPanel.tsx`: solo se mostraban 4 de las 10 tablas del sandbox.
* En `README.md` y `docs/CURRICULUM_SPEC.md`: la tabla física `pagos` era llamada `metodos_pago` con 5 filas (cuando `pagos` tiene 11 filas).

#### 2.3.2 Módulo de Progreso Puro ([`progress.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/progress.ts))
Se implementaron funciones matemáticas puras y deterministas:
```typescript
export function computeOfficialTracksProgress(
  tracks: Track[],
  exercises: Exercise[],
  authoritativeCompletedIds: Set<string>,
  isLoading: boolean
): Track[] {
  if (isLoading) {
    return tracks.map((tr) => ({
      ...tr,
      completed_exercises: null,
      progress_percent: null,
      is_progress_loading: true,
      modules: tr.modules?.map((m) => ({ ...m, completed_count: undefined })),
    }));
  }

  return tracks.map((tr) => {
    const trackModuleIds = new Set((tr.modules || []).map((m) => m.id));
    const trackExercises = exercises.filter((ex) => trackModuleIds.has(ex.module_id));
    const total = trackExercises.length > 0 ? trackExercises.length : (tr.total_exercises || 1);
    
    // Contar únicamente los retos pertenecientes a esta ruta que figuren en authoritativeCompletedIds
    const completed = trackExercises.filter((ex) => authoritativeCompletedIds.has(ex.id)).length;
    const percent = Math.min(100, Math.round((completed / total) * 100));

    const updatedModules = tr.modules?.map((m) => {
      const moduleExercises = trackExercises.filter((ex) => ex.module_id === m.id);
      const modCompleted = moduleExercises.filter((ex) => authoritativeCompletedIds.has(ex.id)).length;
      return {
        ...m,
        exercises_count: moduleExercises.length || m.exercises_count,
        completed_count: modCompleted,
      };
    });

    return {
      ...tr,
      total_exercises: total,
      completed_exercises: completed,
      progress_percent: percent,
      is_progress_loading: false,
      modules: updatedModules,
    };
  });
}
```

#### 2.3.3 Tratamiento de Carga y Shimmer Skeleton ([`TrackCard.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/molecules/TrackCard/TrackCard.tsx))
* Se añadió la propiedad `is_progress_loading?: boolean` y `completed_exercises?: number | null`.
* Cuando `isLoading = track.is_progress_loading || track.completed_exercises === null`:
  * Badge superior: Renderiza `<span className="animate-pulse ...">Sincronizando...</span>`.
  * Texto de métrica: Renderiza `<span className="animate-pulse text-cyan-accent/80 font-medium">Calculando...</span>`.
  * Barra de progreso: Renderiza `<div className="h-full w-full bg-cyan-accent/30 animate-pulse" />`.
  * Se elimina el parpadeo de `0/20 (0%)` mientras los datos se recuperan de la nube.

#### 2.3.4 Esquema Relacional Canónico de 10 Tablas
1. **Exposición en IDE ([`ExerciseSpecPanel.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel.tsx)):**
   Se configuraron las 10 tablas del dataset relacional con sus columnas, PKs y FKs:
   * `clientes` (7 columnas)
   * `categorias` (3 columnas)
   * `proveedores` (4 columnas)
   * `productos` (6 columnas)
   * `pedidos` (5 columnas)
   * `detalle_pedidos` (5 columnas)
   * `almacenes` (4 columnas)
   * `inventario` (4 columnas)
   * `facturas` (5 columnas)
   * `pagos` (6 columnas)
2. **Sincronización de Conteos de Filas:**
   Se alinearon los conteos en `ECOMMERCE_TABLES_SCHEMA` de [`api.ts`](file:///c:/Desarrollo/Qurio/apps/web/src/lib/api.ts) y en [`README.md`](file:///c:/Desarrollo/Qurio/README.md) con la fuente canónica física de [`ecommerce_seed.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/ecommerce_seed.sql):
   * `clientes`: 15
   * `categorias`: 5
   * `proveedores`: 5
   * `productos`: 15
   * `pedidos`: 15
   * `detalle_pedidos`: 24
   * `almacenes`: 3
   * `inventario`: 19
   * `facturas`: 13
   * `pagos`: 11 (con columna `metodo_pago`)
3. **Reconciliación en Especificación Pedagógica ([`docs/CURRICULUM_SPEC.md`](file:///c:/Desarrollo/Qurio/docs/CURRICULUM_SPEC.md)):**
   La fila del reto #27 fue actualizada para describir la conciliación real entre `facturas` y `pagos` (`folio_fiscal`, `metodo_pago`, `monto`, `fecha_pago`), erradicando `metodos_pago`.

---

### 2.4 Bloque D — Navegación Web y Enrutamiento Real (`C-05`)

#### 2.4.1 Diagnóstico de la Brecha
El flujo de vistas se apoyaba exclusivamente en `const [currentPath, setCurrentPath] = useState<AppPath>('dashboard')`. Esto impedía:
* Acceder directamente a un reto mediante un enlace profundo (`/exercises/:id`).
* Conservar el ejercicio activo tras presionar `F5` (el usuario era devuelto al Dashboard).
* Usar los botones de navegación Atrás y Adelante del navegador.
* Gestionar limpiamente tokens de verificación o recuperación de Supabase Auth.

#### 2.4.2 Implementación de Enrutamiento con HTML5 History API ([`App.tsx`](file:///c:/Desarrollo/Qurio/apps/web/src/App.tsx))
Se implementó una solución sin agregar dependencias externas pesadas, basada en la API estándar del navegador:
1. **Mapeo Bidireccional de Rutas:**
   * `pathToUrl`: traduce `AppPath` y parámetros (`exerciseId`, `trackSlug`) a rutas amigables (`/`, `/tracks`, `/tracks/:slug`, `/exercises/:id`, `/playground`, `/profile`, `/achievements`, `/auth/confirm`, `/reset-password`, `/404`).
   * `parseLocation`: descompone `window.location.pathname` extrayendo el path de la aplicación y parámetros asociados.
2. **Función Central de Navegación (`navigate`):**
   * Actualiza el estado reactivo `currentPath`.
   * Si la URL destino difiere de la actual, invoca `window.history.pushState` o `window.history.replaceState`.
3. **Preservación de Estado en Recarga (`F5`):**
   * Al montar la aplicación, lee la URL actual.
   * Si la URL es `/exercises/:id`, busca el reto en el catálogo local.
   * Si el catálogo de la API aún no termina de cargar, almacena el ID en `pendingExerciseId` y lo resuelve en cuanto `api.getExercises()` responde, inicializando Monaco Editor con el reto correcto.
4. **Historial del Navegador:**
   * Listener global `window.addEventListener('popstate', handleLocationChange)` que sincroniza instantáneamente el componente cuando el usuario pulsa Atrás o Adelante.
5. **Detección Limpia de Parámetros Supabase Auth:**
   * Se capturan parámetros como `code` (intercambio PKCE), `token_hash`, `type=recovery` o `type=signup` tanto en query string (`location.search`) como en fragmento (`location.hash`).
   * Redirige a la vista correspondiente (`auth-confirm` o `reset-password`) y sanea la barra de direcciones con `replaceState`.

---

## 3. Desglose Exhaustivo de Pruebas Automatizadas

### 3.1 Suite de Pruebas del Backend (FastAPI + Pytest)
* **Comando:** `$env:PYTHONPATH="apps/api"; python -m pytest apps/api/tests/ -q`
* **Resultado:** **69 pasadas, 0 fallidas en 44.20 segundos (100% de éxito)**.
* **Desacoplamiento de Sandbox:** Se incorporó un `timeout=3.0` en `apps/api/app/modules/runner/service.py` (`asyncpg.create_pool`) y un bloque `try/except` en `apps/api/tests/conftest.py`, permitiendo que pruebas unitarias que no usan base de datos corran sin congelarse si Docker está detenido.

```
.....................................................................    [100%]
69 passed in 44.20s
```

#### Matriz Detallada de Pruebas del Backend:
| Archivo de Prueba | Casos | Aspecto Evaluado | Resultado |
| :--- | :---: | :--- | :---: |
| [`test_schema_consistency.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_schema_consistency.py) | 3 | Valida que `ecommerce_seed.sql` contenga las 10 tablas físicas, que `pagos` y `metodo_pago` sean las fuentes canónicas, que `metodos_pago` no exista en docs ni specs, y que `ExerciseSpecPanel.tsx` exponga las 10 tablas. | ✅ PASÓ |
| [`test_integration.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_integration.py) | 13 | Healthcheck, ejecución en Playground con timeout y límites, bloqueo AST de inyecciones, catálogo sin `solution_query`, rechazo a invitados fuera de trial con HTTP 401 (`test_guest_trial_limit_enforced`), y acreditación de XP a autenticados (`test_submit_exercise_star_challenge_left_join_authenticated`). | ✅ PASÓ |
| [`test_evaluator.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_evaluator.py) | 14 | Capa 1 (tolerancia numérica decimal, comparación de multiconjuntos, orden estricto vs desordenado, tratamiento de nulos) y Capa 2 (AST pedagógico). | ✅ PASÓ |
| [`test_security.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_security.py) | 11 | Bloqueo estricto de sentencias DDL/DML destructivas (`DROP`, `DELETE`, `UPDATE`, `ALTER`, `GRANT`, `COPY`), inyecciones multicomando y CTEs de mutación con SQLGlot. | ✅ PASÓ |
| [`test_auth.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_auth.py) | 8 | Verificación criptográfica JWT ES256, rotación de claves JWKS mockeadas, validación de audiencia (`authenticated`) y expiración. | ✅ PASÓ |
| [`test_rate_limit.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_rate_limit.py) | 4 | Límites de tasa diferenciados (20/min para invitados por IP, 120/min para autenticados por User ID) y semáforo de concurrencia máxima. | ✅ PASÓ |
| [`test_supabase_migration.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_supabase_migration.py) | 16 | Verificación de esquemas Supabase (`01_schema.sql`, `02_seed_curriculum.sql`, `03_security_hardening.sql`), roles `anon` y `authenticated`, políticas RLS, función RPC `record_verified_attempt` y auditoría de rollback. | ✅ PASÓ |

---

### 3.2 Suite de Pruebas del Frontend (React + Vitest)
* **Configuración:** Se integró Vitest en `apps/web/package.json` con el script `"test": "vitest run"`.
* **Comando:** `npm run test` (en `apps/web`)
* **Resultado:** **8 pasadas, 0 fallidas en 848ms (100% de éxito)**.

```
 ✓ src/lib/__tests__/progress.test.ts (5 tests) 5ms
 ✓ src/lib/__tests__/persistence.test.ts (3 tests) 34ms

 Test Files  2 passed (2)
      Tests  8 passed (8)
   Duration  848ms
```

#### Matriz Detallada de Pruebas del Frontend:
| Archivo de Prueba | Caso de Prueba | Comprobación Técnica | Resultado |
| :--- | :--- | :--- | :---: |
| `progress.test.ts` | `isLoading=true` | Devuelve `is_progress_loading: true`, `completed_exercises: null` y `progress_percent: null`. | ✅ PASÓ |
| `progress.test.ts` | `is_completed` local | Ignora `ex.is_completed` si el ID no está en `authoritativeCompletedIds`, arrojando 0% de progreso oficial. | ✅ PASÓ |
| `progress.test.ts` | IDs autoritativos | Computa con exactitud matemática el progreso cruzando módulos y ejercicios de la ruta contra la nube. | ✅ PASÓ |
| `progress.test.ts` | Aislamiento de rutas | Completar retos en Ruta 1 (Foundations) genera avance únicamente en Ruta 1; Ruta 2 (Advanced) permanece en 0%. | ✅ PASÓ |
| `progress.test.ts` | Modo invitado | Computa el avance temporal de prueba de forma completamente independiente de la cuenta oficial. | ✅ PASÓ |
| `persistence.test.ts`| Recuperación `D-05` | Elementos en `'syncing'` con más de 30 segundos son restaurados automáticamente a `'pending'` tras una interrupción. | ✅ PASÓ |
| `persistence.test.ts`| Sincronización idempotente | Al sincronizar, omite ejercicios que ya figuran completados en la nube, llamando a la API solo para los retos faltantes. | ✅ PASÓ |
| `persistence.test.ts`| Blindaje de perfil `C-02`| `updateProfile` guarda datos en local sin emitir llamadas prohibidas a columnas protegidas de Supabase. | ✅ PASÓ |

---

### 3.3 Verificación del Empaquetado de Producción (Vite Build)
* **Comando:** `npm run build` (en `apps/web`)
* **Resultado:**
  * Compilación TypeScript (`tsc`): **0 errores tipográficos**.
  * Empaquetado Vite: **Éxito en 5.47s**.
  * Chunks generados:
    * `dist/index.html` (2.76 kB)
    * `dist/assets/index-CF-l540f.css` (43.75 kB)
    * `dist/assets/index-CGU_UOM6.js` (689.56 kB)
  * **Comprobación de Fuga de Soluciones:**
    * Comando: `Select-String -Path "apps/web/dist/assets/*.js" -Pattern "solution_query"`
    * Coincidencias encontradas: **0**.

---

### 3.4 Sincronización del Grafo de Conocimiento (Graphify)
* **Comando:** `python -m graphify update .`
* **Resultado:** Grafo actualizado con éxito, indexando **1,834 nodos, 2,836 aristas y 123 comunidades**, actualizando:
  * `graphify-out/graph.json`
  * `graphify-out/graph.html`
  * `graphify-out/GRAPH_REPORT.md`
  * `graphify-out/manifest.json`

---

## 4. Inventario de Archivos Modificados y Creados

```
apps/api/
  ├── app/modules/curriculum/seed_data.py          (M: ExercisePublicDTO, to_public_dto)
  ├── app/modules/curriculum/repository.py         (M: list_public, get_public_by_id, get_internal_for_evaluation)
  ├── app/modules/runner/router.py                 (M: DTOs públicos, límite trial 3 retos con HTTP 401)
  ├── app/modules/runner/service.py                (M: timeout=3.0 en asyncpg.create_pool)
  ├── tests/conftest.py                            (M: desacoplamiento de pool para tests unitarios)
  ├── tests/test_integration.py                    (M: test_guest_trial_limit_enforced, test_public_exercises_never_expose_solution_query)
  └── tests/test_schema_consistency.py             (NEW: T-10.3-U3 verificación de 10 tablas y consistencia de esquemas)

apps/web/
  ├── package.json                                 (M: vitest añadido en devDependencies, script "test": "vitest run")
  ├── package-lock.json                            (M: dependencias bloqueadas)
  ├── src/types/index.ts                           (M: solution_query removido de Exercise, is_progress_loading en Track)
  ├── src/lib/api.ts                               (M: 50 solution_query eliminadas de FALLBACK_EXERCISES, conteos reales en ECOMMERCE_TABLES_SCHEMA)
  ├── src/lib/persistence.ts                       (M: escrituras directas suprimidas, qurio_guest_progress_v1, syncGuestProgress, D-05)
  ├── src/lib/progress.ts                          (NEW: computeOfficialTracksProgress, computeGuestTrialTracksProgress)
  ├── src/lib/__tests__/progress.test.ts           (NEW: 5 pruebas unitarias de cómputo y aislamiento de rutas)
  ├── src/lib/__tests__/persistence.test.ts        (NEW: 3 pruebas unitarias de persistencia, migración e interrupción D-05)
  ├── src/hooks/useAuth.tsx                        (M: invocación de syncGuestProgress en SIGNED_IN)
  ├── src/App.tsx                                  (M: History API, deep links /exercises/:id, preservación F5, cálculo aislado de tracks)
  ├── src/components/molecules/TrackCard/          (M: skeleton shimmer y badge "Sincronizando..." en carga)
  ├── src/components/organisms/ExerciseSpecPanel/  (M: 10 tablas relacionales expuestas en pestaña Esquema)
  └── src/components/organisms/TracksView/         (M: soporte de prop isLoading)

docs/
  ├── README.md                                    (M: tabla pagos y 11 filas, conteos reales en las 10 tablas)
  ├── docs/CURRICULUM_SPEC.md                      (M: reto #27 alineado con tabla pagos y metodo_pago)
  ├── docs/BITACORA.md                             (M: Sección 1, Sección 2 y Entrada 24 agregadas)
  ├── docs/audits/QURIO_OPERATIONAL_AUDIT.md       (M: Sección 10 y Sección 11 de certificación de cierre)
  ├── docs/roadmap/QURIO_OPERATIONAL_BASELINE.md   (M: Quality Gates G-01 a G-05 marcados como completados)
  └── docs/audits/QURIO_PHASE_10_STABILIZATION_REPORT.md (NEW: este informe integral)
```

---

## 5. Matriz de Cumplimiento de los Quality Gates del Piloto

| Gate | Descripción | Criterio de Aceptación Exigido | Estado | Evidencia Demostrable |
| :---: | :--- | :--- | :---: | :--- |
| **G-01** | **Seguridad Curricular (`C-01`)** | Cero apariciones de `solution_query` en red, consola, catálogo offline o bundles cliente. | ✅ **CUMPLIDO** | `ExercisePublicDTO` en API y 0 resultados en `dist/assets/*.js`. Prueba `test_public_exercises_never_expose_solution_query` pasando. |
| **G-02** | **Persistencia e Invitados (`C-02` + `D-05`)** | Cero errores 42501 en consola, backend autoritativo y migración idempotente ante interrupciones. | ✅ **CUMPLIDO** | Escrituras directas suprimidas. Límite de 3 ejercicios de prueba en backend con HTTP 401. Suite Vitest `persistence.test.ts` pasando. |
| **G-03** | **Progreso y Esquema (`C-03` + `C-04`)** | Progreso aislado por ruta sin duplicación, skeleton de carga y 10 tablas visibles en el IDE. | ✅ **CUMPLIDO** | `computeOfficialTracksProgress` implementada y probada (5 tests Vitest). 10 tablas visibles en `ExerciseSpecPanel`. Conteos sincronizados. |
| **G-04** | **Navegación Web (`C-05`)** | History API activa con deep linking (`/exercises/:id`), preservación de reto en `F5` y soporte Atrás/Adelante. | ✅ **CUMPLIDO** | Navegación nativa implementada en `App.tsx` con listener `popstate`, mapeo bidireccional y saneamiento de tokens Auth. |
| **G-05** | **Suite Completa de Pruebas** | Cobertura integral en backend y frontend sin regresiones. | ✅ **CUMPLIDO** | **69/69 backend + 8/8 frontend** pasando. Docker Sandbox apagado ordenadamente (`docker compose down`). |
| **G-06** | **Validación Interactiva del Flujo** | Recorrido manual guiado por el flujo de 21 pasos de usuario. | ⏳ **PENDIENTE** | Listo para ser ejecutado en sesión local previa a la incorporación de alumnos. |
| **G-07** | **Aprobación del Propietario** | Autorización formal para abrir la plataforma a los primeros alumnos piloto. | ⏳ **PENDIENTE** | Sujeto a la revisión final de este informe y validación de G-06. |

---

## 6. Conclusión y Recomendación Operativa

La base de código de Qurio se encuentra en un estado de **estabilidad técnica superior**. Los cuatro bloques de la Fase 10 han resuelto todos los defectos estructurales identificados en la auditoría.

El proyecto está técnicamente listo para:
1. **Revisar y fusionar la rama [`feat/phase-10-stabilization`](https://github.com/ErickKNT/qurio/tree/feat/phase-10-stabilization) hacia `main`.**
2. **Ejecutar la validación manual interactiva del Gate G-06** con Docker Sandbox activo en local.
3. **Autorizar el Gate G-07** para incorporar a los primeros 10 a 20 estudiantes de prueba en un entorno educativo confiable, seguro y profesional.
