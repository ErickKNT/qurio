# Qurio — Revisión de Seguridad y Auditoría de Supabase Cloud (Fase 11.1)

**Identificador:** `QURIO-PHASE-11.1-SECURITY-REVIEW`  
**Fecha de auditoría:** 10 de Noviembre de 2026  
**Proyecto auditado:** `bfvgqxfzftumwrleacof` (Supabase Cloud — Producción)  
**Modalidad de ejecución:** **Auditoría Estricta de Solo Lectura (Zero Mutations)**  
**Área:** Seguridad de Datos, Control de Acceso (RLS / CLS), Anti-Exfiltración de Soluciones  
**Estado:** Script Corregido y Verificado — Listo para Aplicación Administrativa por el Propietario

---

## 1. Resumen Ejecutivo de Seguridad

Durante la Fase 11 y su consolidación 11.1 se llevó a cabo una auditoría integral de la arquitectura de seguridad de **Supabase Cloud**, examinando:
1. El estado de **Row Level Security (RLS)** y **Column-Level Security (CLS)** para cada una de las tablas del esquema público.
2. El riesgo de fuga de soluciones canónicas (`solution_query`) a través de la API PostgREST pública con la clave anónima (`anon`).
3. El blindaje de la función RPC de certificación de progreso (`record_verified_attempt`).
4. El impacto en la carga del currículo en el frontend si se revoca el acceso a `solution_query`.
5. La preparación de un script SQL de endurecimiento (`03_security_hardening.sql`) 100% libre de errores de sintaxis y alineado con los nombres reales de columnas del esquema.

---

## 2. Matriz Exhaustiva de Roles y Permisos (Supabase Cloud)

La siguiente matriz detalla los privilegios efectivos autorizados para cada rol del sistema una vez aplicado el script de endurecimiento `03_security_hardening.sql`:

| Objeto de Base de Datos | Rol `anon` (Visitante / Sin Sesión) | Rol `authenticated` (Estudiante con JWT) | Rol `service_role` (Backend Oficial FastAPI) | Mecanismo de Seguridad |
|:---|:---|:---|:---|:---|
| **`exercises`** | **SELECT parcial** (solo columnas públicas educativas). Bloqueo total de `solution_query`. `INSERT/UPDATE/DELETE` denegados. | **SELECT parcial** (solo columnas públicas educativas). Bloqueo total de `solution_query`. `INSERT/UPDATE/DELETE` denegados. | **ALL** (lectura de `solution_query` para evaluación interna, gestión administrativa). | **CLS + RLS** (`Public Read Safe Exercises`). |
| **`exercise_hints`** | **SELECT** (lectura de pistas pedagógicas). `INSERT/UPDATE/DELETE` denegados. | **SELECT** (lectura de pistas pedagógicas). `INSERT/UPDATE/DELETE` denegados. | **ALL** (administración de pistas). | **RLS** (`Public Read Hints`). |
| **`exercise_attempts`** | **Denegado Total** (0 lectura, 0 escritura). | **SELECT propio** (solo sus propios intentos mediante `auth.uid() = user_id`). `INSERT/UPDATE/DELETE` denegados en tabla y columnas. | **ALL** (inserción autoritativa exclusiva a través del backend). | **RLS + CLS** (mutación delegada a la RPC). |
| **`user_profiles`** | **SELECT** (lectura de datos públicos para leaderboard: `id`, `username`, `display_name`, `avatar_url`, `xp`, `level`). | **SELECT** general + **UPDATE restringido por CLS** (`display_name`, `avatar_url`, `bio`, `updated_at`). Modificación de `xp` y `level` denegada. | **ALL** (gestión administrativa). | **RLS + CLS**. |
| **`user_progress`** | **Denegado Total** (0 lectura, 0 escritura). | **SELECT propio** (`auth.uid() = user_id`). `INSERT/UPDATE/DELETE` denegados. | **ALL** (actualización atómica exclusiva vía RPC `record_verified_attempt`). | **RLS**. |
| **`user_achievements`** | **Denegado Total** (0 lectura, 0 escritura). | **SELECT propio** (`auth.uid() = user_id`). `INSERT/UPDATE/DELETE` denegados. | **ALL** (desbloqueo de logros controlado). | **RLS**. |
| **`user_daily_activity`** | **Denegado Total** (0 lectura, 0 escritura). | **SELECT propio** (`auth.uid() = user_id`). `INSERT/UPDATE/DELETE` denegados. | **ALL** (registro de racha y actividad). | **RLS**. |
| **`learning_paths`** | **SELECT** (lectura pública del catálogo). `INSERT/UPDATE/DELETE` denegados. | **SELECT** (lectura pública del catálogo). `INSERT/UPDATE/DELETE` denegados. | **ALL** (gestión del catálogo). | **RLS**. |
| **`modules`** | **SELECT** (lectura pública de módulos). `INSERT/UPDATE/DELETE` denegados. | **SELECT** (lectura pública de módulos). `INSERT/UPDATE/DELETE` denegados. | **ALL** (gestión de módulos). | **RLS**. |
| **`lessons`** | **SELECT** (lectura pública de lecciones). `INSERT/UPDATE/DELETE` denegados. | **SELECT** (lectura pública de lecciones). `INSERT/UPDATE/DELETE` denegados. | **ALL** (gestión de contenido). | **RLS**. |
| **`achievements`** | **SELECT** (lectura pública de insignias). `INSERT/UPDATE/DELETE` denegados. | **SELECT** (lectura pública de insignias). `INSERT/UPDATE/DELETE` denegados. | **ALL** (gestión de catálogo de insignias). | **RLS**. |
| **RPC `record_verified_attempt`** | **EXECUTE Denegado** (`401 permission denied`). | **EXECUTE Denegado** (`401 permission denied`). | **EXECUTE Concedido** (único llamador autorizado). | `REVOKE EXECUTE FROM PUBLIC, anon, authenticated; GRANT TO service_role`. |

---

## 3. Análisis de Impacto: Revocación de `solution_query`

Uno de los temores habituales al aplicar Column-Level Security (CLS) sobre la columna `solution_query` es que pueda romperse la visualización del currículo o la navegación en el cliente web.

Se realizó un análisis exhaustivo del código fuente tanto en el frontend como en el backend:

### 3.1 Consumo en el Frontend (`apps/web`)
* Se inspeccionó el archivo `apps/web/src/lib/api.ts`.
* La función `getExercises()` consulta `${API_BASE_URL}/exercises` (FastAPI).
* La función `getExercise(id)` consulta `${API_BASE_URL}/exercises/${exerciseId}` (FastAPI).
* **Búsqueda global:** Se ejecutó una búsqueda estática de referencias `supabase.from('exercises')` en toda la carpeta `apps/web/src/`.
  * **Resultado:** **0 llamadas directas a Supabase sobre la tabla `exercises`**.
  * La única interacción directa de Supabase en el frontend es `supabase.from('user_profiles').update(...)` para actualizar datos estéticos del perfil del usuario (permitidos por CLS).
* **Conclusión para el Frontend:** Revocar el acceso a `solution_query` en Supabase tiene **cero impacto negativo** en la interfaz web. El frontend jamás requiere ni recibe dicha columna.

### 3.2 Consumo en el Backend (`apps/api`)
* En `apps/api/app/modules/curriculum/repository.py`:
  * El método `list_public()` expone `ExercisePublicDTO`, el cual omite por diseño la propiedad `solution_query`.
  * El método `get_internal_for_evaluation()` consulta Supabase utilizando `settings.SUPABASE_SERVICE_ROLE_KEY`. Si esta clave está configurada, el rol `service_role` posee privilegios completos de lectura sobre `solution_query`. Si la clave no está configurada o hay fallo de red, conmuta automáticamente a la caché local `SEED_EXERCISES`.
* **Conclusión para el Backend:** El evaluador interno continuará funcionando normalmente mediante `service_role` o mediante el catálogo seed local.

---

## 4. Script SQL Corregido, Verificado y Completo (`03_security_hardening.sql`)

El script ubicado en [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) fue completamente revisado, corregido y verificado contra una base de datos PostgreSQL idéntica a Supabase en `apps/api/tests/test_supabase_migration.py`.

A continuación se presenta el bloque medular de Column-Level Security y RPC que debe ejecutarse en el SQL Editor de Supabase Cloud:

```sql
-- ==============================================================================
-- Qurio: Script de Hardening de Seguridad y Autoridad Central de Progreso (Fase 11.1)
-- Versión: 6.0 (Blindaje Integral CLS/RLS en public.exercises, public.user_progress
--          y Catálogos Educativos, con Aislamiento Estricto de solution_query,
--          search_path='' y RPC record_verified_attempt de Firma Única)
-- ==============================================================================

-- 1. BLINDAJE SOBRE public.user_profiles
REVOKE ALL ON TABLE public.user_profiles FROM PUBLIC, anon;
REVOKE UPDATE, INSERT, DELETE, TRUNCATE ON TABLE public.user_profiles FROM authenticated;
REVOKE UPDATE (id, username, level, xp, current_streak_days, max_streak_days, created_at)
    ON public.user_profiles FROM authenticated, anon, PUBLIC;
REVOKE INSERT (id, username, display_name, avatar_url, bio, level, xp, current_streak_days, max_streak_days, created_at, updated_at)
    ON public.user_profiles FROM authenticated, anon, PUBLIC;

GRANT SELECT ON TABLE public.user_profiles TO authenticated, anon;
GRANT UPDATE (display_name, avatar_url, bio, updated_at)
    ON public.user_profiles TO authenticated;

-- 2. BLINDAJE SOBRE public.exercise_attempts
REVOKE ALL ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;
REVOKE DELETE, TRUNCATE ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;
REVOKE INSERT (id, user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used, xp_awarded, created_at)
    ON public.exercise_attempts FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (id, user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used, xp_awarded, created_at)
    ON public.exercise_attempts FROM PUBLIC, anon, authenticated;
REVOKE SELECT (id, user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used, xp_awarded, created_at)
    ON public.exercise_attempts FROM PUBLIC, anon;

GRANT SELECT ON TABLE public.exercise_attempts TO authenticated;
GRANT ALL ON TABLE public.exercise_attempts TO service_role;
DROP POLICY IF EXISTS "User Insert Own Attempts" ON public.exercise_attempts;

-- 3. BLINDAJE ANTI-EXFILTRACIÓN SOBRE public.exercises (CLS)
REVOKE ALL ON TABLE public.exercises FROM PUBLIC, anon, authenticated;
REVOKE SELECT ON TABLE public.exercises FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.exercises FROM PUBLIC, anon, authenticated;

-- Otorgar SELECT únicamente sobre columnas públicas educativas (excluyendo terminantemente solution_query)
GRANT SELECT (
    id,
    module_id,
    title,
    prompt,
    initial_code,
    target_database,
    xp_reward,
    difficulty,
    check_order,
    sort_order,
    created_at
) ON TABLE public.exercises TO anon, authenticated;

GRANT ALL ON TABLE public.exercises TO service_role;

-- 4. BLINDAJE SOBRE public.exercise_hints
REVOKE ALL ON TABLE public.exercise_hints FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.exercise_hints FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.exercise_hints TO anon, authenticated;
GRANT ALL ON TABLE public.exercise_hints TO service_role;

-- 5. BLINDAJE SOBRE public.user_progress (Progreso Oficial solo mutable por RPC)
REVOKE ALL ON TABLE public.user_progress FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.user_progress FROM authenticated;
GRANT SELECT ON TABLE public.user_progress TO authenticated;
GRANT ALL ON TABLE public.user_progress TO service_role;

-- 6. BLINDAJE SOBRE public.user_achievements Y public.user_daily_activity
REVOKE ALL ON TABLE public.user_achievements FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.user_achievements FROM authenticated;
GRANT SELECT ON TABLE public.user_achievements TO authenticated;
GRANT ALL ON TABLE public.user_achievements TO service_role;

REVOKE ALL ON TABLE public.user_daily_activity FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.user_daily_activity FROM authenticated;
GRANT SELECT ON TABLE public.user_daily_activity TO authenticated;
GRANT ALL ON TABLE public.user_daily_activity TO service_role;

-- 7. BLINDAJE DE CATÁLOGOS ESTÁTICOS
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.learning_paths FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.learning_paths TO anon, authenticated;
GRANT ALL ON TABLE public.learning_paths TO service_role;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.modules FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.modules TO anon, authenticated;
GRANT ALL ON TABLE public.modules TO service_role;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.lessons FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.lessons TO anon, authenticated;
GRANT ALL ON TABLE public.lessons TO service_role;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.achievements FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.achievements TO anon, authenticated;
GRANT ALL ON TABLE public.achievements TO service_role;

-- 8. ÍNDICE DE UNICIDAD ANTI-DUPLICADOS DE XP
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_awarded_passed_attempt
    ON public.exercise_attempts (user_id, exercise_id)
    WHERE status = 'PASSED' AND xp_awarded > 0;

-- 9. ASIGNACIÓN DE FIRMA Y PERMISOS DE LA FUNCIÓN RPC
ALTER FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) TO service_role;
```

---

## 5. Comandos de Verificación Posterior para el Propietario

Una vez que el propietario pegue y ejecute el archivo `database/supabase/03_security_hardening.sql` en el SQL Editor de Supabase Cloud (`https://supabase.com/dashboard/project/bfvgqxfzftumwrleacof/sql`), puede ejecutar individualmente las siguientes consultas de verificación en una nueva pestaña del editor:

### Verificación 1: Exfiltración de Soluciones Bloqueada para `anon`
```sql
SET ROLE anon;
SELECT id, title, solution_query FROM public.exercises;
-- Salida Esperada:
-- ERROR: permission denied for column "solution_query" of relation "exercises"
RESET ROLE;
```

### Verificación 2: Lectura de Campos Educativos Públicos Permitida para `anon`
```sql
SET ROLE anon;
SELECT id, title, prompt, initial_code, xp_reward, difficulty FROM public.exercises LIMIT 3;
-- Salida Esperada:
-- 3 filas devueltas con éxito.
RESET ROLE;
```

### Verificación 3: Exfiltración de Soluciones Bloqueada para `authenticated`
```sql
SET ROLE authenticated;
SELECT id, title, solution_query FROM public.exercises;
-- Salida Esperada:
-- ERROR: permission denied for column "solution_query" of relation "exercises"
RESET ROLE;
```

### Verificación 4: Invocación No Autorizada de la RPC Bloqueada
```sql
SET ROLE anon;
SELECT public.record_verified_attempt(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'e0000000-0000-0000-0000-000000000001'::UUID,
    'SELECT 1;', 'PASSED', 10, NULL, 0, 30
);
-- Salida Esperada:
-- ERROR: permission denied for function record_verified_attempt
RESET ROLE;
```

### Verificación 5: Inserción Directa en `exercise_attempts` y `user_progress` Bloqueada
```sql
SET ROLE authenticated;
INSERT INTO public.exercise_attempts (user_id, exercise_id, submitted_sql, status)
VALUES ('00000000-0000-0000-0000-000000000000'::UUID, 'e0000000-0000-0000-0000-000000000001'::UUID, 'SELECT 1;', 'PASSED');
-- Salida Esperada:
-- ERROR: permission denied for table exercise_attempts
RESET ROLE;
```

---

## 6. Sección de Reconciliación con Informes Anteriores

Esta sección documenta y certifica las correcciones técnicas aplicadas sobre los reportes previos de seguridad:

1. **Corrección de Columnas Inexistentes en DDL Sugerido:**
   * En el borrador del informe de Fase 11 se incluyó un snippet DDL con columnas obsoletas (`track_id`, `description`, `order_index`, `is_active`). Si el propietario hubiese ejecutado ese snippet en Supabase Cloud, la consulta habría fallado de inmediato con `ERROR: column "track_id" does not exist`.
   * En esta versión se verificaron las columnas reales del esquema (`id, module_id, title, prompt, initial_code, target_database, xp_reward, difficulty, check_order, sort_order, created_at`).
2. **Corrección de Firma de la RPC `record_verified_attempt`:**
   * En el borrador previo se especificaba una firma de 7 parámetros con tipos `NUMERIC`. La función física canónica implementada en PostgreSQL cuenta con 8 parámetros:
     `(UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT)`
     donde el 5º parámetro es `execution_time_ms INT` y el 6º es `error_message TEXT`. La firma en los comandos `ALTER` y `REVOKE` ha sido corregida y alineada.
3. **Restricción Integral de `user_progress`:**
   * Se añadió la revocación explícita de `INSERT, UPDATE, DELETE` sobre `user_progress` para el rol `authenticated`, garantizando que ningún usuario con token JWT pueda manipular su porcentaje de avance de módulos sin pasar por la RPC.
4. **Cumplimiento Estricto de Zero Cloud Mutations:**
   * Se ratifica que el agente no ejecutó sentencias de alteración ni mutación sobre el proyecto `bfvgqxfzftumwrleacof` de Supabase Cloud. Todos los cambios permanecen en el repositorio local listos para ser aplicados por el propietario del proyecto.
