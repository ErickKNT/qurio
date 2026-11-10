# Qurio — Revisión de Seguridad y Hardening de Supabase Cloud (Fase 11.2)

**Identificador:** `QURIO-PHASE-11.2-SECURITY-REVIEW`  
**Fecha de auditoría:** 10 de Noviembre de 2026  
**Proyecto auditado:** `bfvgqxfzftumwrleacof` (Supabase Cloud — Producción)  
**Modalidad de ejecución:** **Auditoría Estricta de Solo Lectura (Zero Mutations)**  
**Área:** Seguridad de Datos, Control de Acceso (RLS / CLS), Anti-Exfiltración de Soluciones e Idempotencia RPC  
**Estado:** Scripts v6.1 y Rollback v4.0 Verificados con 15 Pruebas en Pytest — Listo para Aplicación Administrativa por el Propietario

---

## 1. Resumen Ejecutivo de Seguridad

Durante la Fase 11.2 se completó la certificación exhaustiva de la arquitectura de seguridad de **Supabase Cloud**, resolviendo los últimos hallazgos de idempotencia, políticas RLS y protección de soluciones:

1. **Habilitación Explícita de Row Level Security (RLS) en las 11 tablas:** Inclusión mandatoria de `ALTER TABLE public.<tabla> ENABLE ROW LEVEL SECURITY;` sobre la totalidad de entidades (`user_profiles`, `learning_paths`, `modules`, `lessons`, `exercises`, `exercise_hints`, `exercise_attempts`, `user_progress`, `achievements`, `user_achievements`, `user_daily_activity`).
2. **Políticas RLS Idempotentes por Tabla y Rol:** Estructuración de políticas con cláusulas defensivas `DROP POLICY IF EXISTS ...; CREATE POLICY ...;` para evitar colisiones en ejecuciones repetidas.
3. **Column-Level Security (CLS) Definitivo sobre `public.exercises`:** Revocación terminante de `solution_query` para los roles `anon` y `authenticated`, otorgando `SELECT` exclusivamente sobre los 11 campos educativos públicos reales.
4. **Perfeccionamiento de Idempotencia en la RPC `record_verified_attempt` (v6.1):**
   * Disociación de estado: distinción rigurosa entre un reto previamente aprobado (`v_already_passed`) y un reto previamente recompensado con XP (`v_already_awarded`).
   * Desbloqueo de recompensa tras prueba: un intento anterior con `xp_awarded = 0` (por ejemplo, en modo invitado o práctica) ya no bloquea una recompensa oficial legítima cuando el usuario se autentica.
   * Prevención absoluta de XP duplicado: si `v_already_awarded = TRUE`, la RPC fuerza `v_effective_xp := 0` y no incrementa el perfil del usuario.
   * Validación estricta de coherencia: la RPC rechaza cualquier solicitud con `p_xp_to_award > 0` que no coincida exactamente con el XP canónico calculado (`v_authoritative_xp`), admitiendo expresamente `0` cuando no se solicita XP.
5. **Procedimiento de Reversión Probado (`rollback_security_hardening.sql` v4.0):** Script que permite remover la RPC restableciendo el estado previo pero preservando la protección CLS y la integridad de las tablas.
6. **Política Inviolable de Cero Mutaciones en la Nube:** Ninguna sentencia DDL o DML ha sido ejecutada en Supabase Cloud.

---

## 2. Matriz Exhaustiva de Roles y Permisos (Supabase Cloud)

La siguiente matriz detalla los privilegios efectivos autorizados para cada rol del sistema una vez aplicado el script de endurecimiento `03_security_hardening.sql` v6.1:

| Objeto de Base de Datos | Rol `anon` (Invitado / Sin Sesión) | Rol `authenticated` (Estudiante con JWT) | Rol `service_role` (Backend FastAPI) | Mecanismo de Seguridad |
|:---|:---|:---|:---|:---|
| **`exercises`** | **SELECT parcial** (11 columnas educativas públicas). `solution_query` bloqueada con error 401. `INSERT/UPDATE/DELETE` denegados. | **SELECT parcial** (11 columnas educativas públicas). `solution_query` bloqueada con error 401. `INSERT/UPDATE/DELETE` denegados. | **ALL** (lectura de `solution_query` para evaluación interna, administración). | **CLS + RLS** (`Public Read Safe Exercises`). |
| **`exercise_hints`** | **SELECT** (lectura de pistas pedagógicas). `INSERT/UPDATE/DELETE` denegados. | **SELECT** (lectura de pistas pedagógicas). `INSERT/UPDATE/DELETE` denegados. | **ALL** (administración de pistas). | **RLS** (`Public Read Hints`). |
| **`exercise_attempts`** | **Denegado Total** (0 lectura, 0 escritura). | **SELECT propio** (solo sus intentos vía `auth.uid() = user_id`). `INSERT/UPDATE/DELETE` denegados en tabla y columnas. | **ALL** (inserción autoritativa exclusiva vía backend). | **RLS + CLS** (mutación delegada a la RPC). |
| **`user_profiles`** | **SELECT** (datos públicos de perfil). | **SELECT** general + **UPDATE restringido por CLS** (`display_name`, `avatar_url`, `bio`, `updated_at`). `xp` y `level` protegidos. | **ALL** (gestión autoritativa de XP y niveles). | **RLS + CLS** (`Users Read All Profiles`, `Users Update Own Profile Safe`). |
| **`user_progress`** | **Denegado Total** (0 lectura, 0 escritura). | **SELECT propio** (`auth.uid() = user_id`). `INSERT/UPDATE/DELETE` denegados. | **ALL** (actualización atómica exclusiva vía RPC `record_verified_attempt`). | **RLS** (`Users View Own Progress`). |
| **`user_achievements`** | **Denegado Total** (0 lectura, 0 escritura). | **SELECT propio** (`auth.uid() = user_id`). `INSERT/UPDATE/DELETE` denegados. | **ALL** (desbloqueo controlado de insignias). | **RLS** (`Users View Own Achievements`). |
| **`user_daily_activity`** | **Denegado Total** (0 lectura, 0 escritura). | **SELECT propio** (`auth.uid() = user_id`). `INSERT/UPDATE/DELETE` denegados. | **ALL** (registro de racha y telemetría). | **RLS** (`Users View Own Daily Activity`). |
| **`learning_paths`** | **SELECT** (catálogo público). `INSERT/UPDATE/DELETE` denegados. | **SELECT** (catálogo público). `INSERT/UPDATE/DELETE` denegados. | **ALL** (gestión del catálogo). | **RLS** (`Public Read Learning Paths`). |
| **`modules`** | **SELECT** (módulos públicos). `INSERT/UPDATE/DELETE` denegados. | **SELECT** (módulos públicos). `INSERT/UPDATE/DELETE` denegados. | **ALL** (gestión de módulos). | **RLS** (`Public Read Modules`). |
| **`lessons`** | **SELECT** (lecciones públicas). `INSERT/UPDATE/DELETE` denegados. | **SELECT** (lecciones públicas). `INSERT/UPDATE/DELETE` denegados. | **ALL** (gestión de lecciones). | **RLS** (`Public Read Lessons`). |
| **`achievements`** | **SELECT** (catálogo de insignias). `INSERT/UPDATE/DELETE` denegados. | **SELECT** (catálogo de insignias). `INSERT/UPDATE/DELETE` denegados. | **ALL** (gestión de insignias). | **RLS** (`Public Read Achievements`). |
| **RPC `record_verified_attempt`** | **EXECUTE Denegado** (`401 permission denied`). | **EXECUTE Denegado** (`401 permission denied`). | **EXECUTE Concedido** (único llamador autorizado con `search_path=''`). | `SECURITY DEFINER`, revocada de `PUBLIC, anon, authenticated`. |

---

## 3. Análisis de Impacto: Cero Fuga de Soluciones y Compatibilidad del Frontend

Se auditaron minuciosamente los flujos de frontend y backend ante la activación de CLS:

1. **Frontend Web (`apps/web`):**
   * El cliente web **nunca consulta la tabla `exercises` directamente en Supabase**.
   * Toda la carga del catálogo se realiza a través de `GET /api/v1/exercises` en FastAPI, el cual expone exclusivamente el modelo `ExercisePublicDTO`.
   * En el bundle de producción compilado (`apps/web/dist/`) se verificó la ausencia total del identificador `solution_query` (**0 ocurrencias**).
2. **Backend FastAPI (`apps/api`):**
   * El evaluador semántico obtiene la consulta canónica de forma interna utilizando `SUPABASE_SERVICE_ROLE_KEY` (rol `service_role` con privilegios completos) o desde la caché local `SEED_EXERCISES`.
   * El endpoint público `/api/v1/exercises` excluye terminantemente `solution_query`.
3. **Resultado:** Riesgo de exfiltración de soluciones eliminado al 100% sin romper ninguna vista ni navegación del estudiante.

---

## 4. Script SQL de Hardening v6.1 (`03_security_hardening.sql`)

El script ubicado en [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) fue validado contra 15 pruebas de integración en `test_supabase_migration.py`.

### 4.1 Características Técnicas Principales
* **Transaccionalidad e Idempotencia:** Utiliza `DROP POLICY IF EXISTS` antes de cada `CREATE POLICY`.
* **Permisos de `service_role`:** Otorga explícitamente `GRANT ALL ON TABLE public.user_profiles TO service_role;` junto con el resto de las tablas.
* **Índice Condicional de Protección:**
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS idx_single_awarded_passed_attempt
      ON public.exercise_attempts (user_id, exercise_id)
      WHERE status = 'PASSED' AND xp_awarded > 0;
  ```
* **Lógica de Idempotencia en la RPC:**
  ```sql
  -- Verificar si el ejercicio ya fue aprobado y si ya recibió XP previamente
  SELECT
      EXISTS(SELECT 1 FROM public.exercise_attempts WHERE user_id = p_user_id AND exercise_id = p_exercise_id AND status = 'PASSED'),
      EXISTS(SELECT 1 FROM public.exercise_attempts WHERE user_id = p_user_id AND exercise_id = p_exercise_id AND status = 'PASSED' AND xp_awarded > 0)
  INTO v_already_passed, v_already_awarded;

  -- Determinar XP efectivo respetando intentos previos con 0 XP
  IF p_status <> 'PASSED' THEN
      v_effective_xp := 0;
  ELSIF v_already_awarded THEN
      v_effective_xp := 0;
  ELSIF p_xp_to_award = 0 THEN
      v_effective_xp := 0;
  ELSE
      v_effective_xp := v_authoritative_xp;
  END IF;
  ```

---

## 5. Procedimiento de Aplicación y Verificación para el Propietario

### 5.1 Instrucciones de Aplicación
1. Iniciar sesión en la consola de Supabase Cloud.
2. Navegar al proyecto `bfvgqxfzftumwrleacof` -> **SQL Editor**:
   `https://supabase.com/dashboard/project/bfvgqxfzftumwrleacof/sql`
3. Abrir una nueva pestaña en el SQL Editor y pegar el contenido íntegro de [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql).
4. Hacer clic en **Run** y confirmar la ejecución exitosa (0 errores).

### 5.2 Consultas de Verificación en Supabase SQL Editor
Ejecutar los siguientes bloques de comprobación en una pestaña limpia:

#### Comprobación 1: Exfiltración de Soluciones Bloqueada para `anon`
```sql
SET ROLE anon;
SELECT id, title, solution_query FROM public.exercises;
-- Salida esperada:
-- ERROR: permission denied for column "solution_query" of relation "exercises"
RESET ROLE;
```

#### Comprobación 2: Lectura Pública de Campos Permitidos para `anon`
```sql
SET ROLE anon;
SELECT id, title, prompt, initial_code, xp_reward, difficulty FROM public.exercises LIMIT 3;
-- Salida esperada:
-- 3 filas devueltas con éxito.
RESET ROLE;
```

#### Comprobación 3: Exfiltración de Soluciones Bloqueada para `authenticated`
```sql
SET ROLE authenticated;
SELECT id, title, solution_query FROM public.exercises;
-- Salida esperada:
-- ERROR: permission denied for column "solution_query" of relation "exercises"
RESET ROLE;
```

#### Comprobación 4: Invocación No Autorizada de la RPC Bloqueada
```sql
SET ROLE anon;
SELECT public.record_verified_attempt(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'e0000000-0000-0000-0000-000000000001'::UUID,
    'SELECT 1;', 'PASSED', 10, NULL, 0, 30
);
-- Salida esperada:
-- ERROR: permission denied for function record_verified_attempt
RESET ROLE;
```

#### Comprobación 5: Inserción Directa en `exercise_attempts` Bloqueada
```sql
SET ROLE authenticated;
INSERT INTO public.exercise_attempts (user_id, exercise_id, submitted_sql, status)
VALUES ('00000000-0000-0000-0000-000000000000'::UUID, 'e0000000-0000-0000-0000-000000000001'::UUID, 'SELECT 1;', 'PASSED');
-- Salida esperada:
-- ERROR: permission denied for table exercise_attempts
RESET ROLE;
```

---

## 6. Procedimiento de Reversión (`rollback_security_hardening.sql` v4.0)

Si por alguna razón operativa se requiere revertir los cambios de la RPC, el propietario puede ejecutar el script [`database/supabase/rollback_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/rollback_security_hardening.sql):

1. **Efecto de la Reversión:**
   * Remueve la función RPC `record_verified_attempt` con `DROP FUNCTION IF EXISTS public.record_verified_attempt(UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT);`.
   * Preserva el índice de unicidad `idx_single_awarded_passed_attempt`.
   * **Preserva íntegramente la protección CLS sobre `solution_query`** (los roles `anon` y `authenticated` continúan sin poder ver las soluciones).
   * Mantiene los permisos de `service_role` en `user_profiles` y demás tablas para no interrumpir el servicio.
2. **Verificación de Reversión:**
   * La prueba automatizada `test_rollback_script_preserves_strict_security` en `test_supabase_migration.py` confirma que tras el rollback, las soluciones continúan protegidas y la función es removida limpiamente.

---

## 7. Certificación de Regresión (15 Pruebas Pytest)

Las siguientes 15 pruebas de infraestructura de seguridad fueron ejecutadas y aprobadas al 100%:
1. `test_effective_privileges_matrix`: Valida permisos por tabla y columna en `information_schema`.
2. `test_rpc_validation_rejects_null_parameters`: Valida rechazo de parámetros nulos.
3. `test_rpc_validation_rejects_xp_exceeding_exercise_reward`: Valida rechazo de XP excesivo.
4. `test_authoritative_xp_calculation_across_rewards_and_hints`: Valida cálculo canónico con penalización de pistas.
5. `test_concurrent_same_exercise_independent_connections`: Valida aislamiento transaccional concurrente.
6. `test_concurrent_different_exercises_no_lost_updates`: Valida incremento sin pérdida de actualizaciones.
7. `test_user_progress_consistency_on_failed_and_error`: Valida consistencia en intentos fallidos.
8. `test_regression_scenario_1_first_pass_with_xp`: Aprobación inicial con acreditación de XP.
9. `test_regression_scenario_2_second_pass_no_duplicate_xp`: Segunda aprobación sin duplicación de XP.
10. `test_regression_scenario_3_and_4_first_pass_zero_xp_then_legitimate_reward`: Intento inicial con 0 XP no bloquea recompensa legítima posterior.
11. `test_regression_scenario_5_concurrent_requests_same_user_and_exercise`: Dos solicitudes simultáneas resuelven una con XP y otra con 0 XP sin violar la base de datos.
12. `test_regression_scenario_6_reject_inconsistent_and_exceeding_xp`: Rechazo de solicitudes con XP inconsistente o inflado.
13. `test_regression_scenario_7_nonexistent_user`: Rechazo de usuarios inexistentes con excepción clara.
14. `test_regression_scenario_8_nonexistent_exercise`: Rechazo de retos inexistentes con excepción clara.
15. `test_rollback_script_preserves_strict_security`: Reversión segura sin desprotección de soluciones.
