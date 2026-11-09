# Informe de Resultados de Remediación y Hardening de Seguridad (Fase 9) — Qurio

**Fecha:** 9 de Noviembre de 2026  
**Versión:** 3.0 (Auditoría Final Multidisciplinaria: PostgreSQL Security, Supabase Hardening, AppSec y QA)  
**Rama Git:** `security/phase-9-hardening`  
**Estado:** Validación Técnica y Automatizada Concluida al 100% (Listo para Revisión Previa; **NO se ejecutará en Supabase Cloud sin autorización explícita del usuario**)  
**Autores:** Equipo de Seguridad de Base de Datos PostgreSQL, AppSec, Supabase Platform Security y QA de Qurio  

---

## 1. Resumen Ejecutivo

En cumplimiento de los requerimientos de la auditoría final para la **Fase 9: Hardening de Seguridad**, se ha completado el endurecimiento integral de la plataforma interactiva de SQL **Qurio**. La solución implementa el principio de **defensa en profundidad estricta** en todas las capas del sistema (Sandbox, Backend FastAPI, Autenticación Asimétrica ES256 y Base de Datos Supabase/PostgreSQL).

### Indicadores Clave de Calidad y Seguridad
* **Batería Completa de Pruebas Automatizadas:** **61 de 61 pruebas pasando exitosamente en 3.10s** (`61/61 PASSED`):
  * `test_security.py`: 23/23 pruebas (AST con SQLGlot, prevención de SQLi, contención de CTEs recursivos, validación de las 18 consultas oficiales del currículo).
  * `test_evaluator.py`: 13/13 pruebas (Evaluador semántico de dos capas: precisión exacta `Decimal` sin colapso IEEE 754 y verificación de requisitos pedagógicos obligatorios como `ROUND()`).
  * `test_auth.py`: 6/6 pruebas (Autenticación asimétrica ES256 vía JWKS, expiración, audience y modo invitado aislado).
  * `test_rate_limit.py`: 1/1 prueba (Rate limiting en memoria por IP/Usuario y semáforo de concurrencia).
  * `test_integration.py`: 11/11 pruebas (Flujo integral de endpoints, contratos de API y manejo de errores).
  * `test_supabase_migration.py`: 7/7 pruebas (Matriz de privilegios efectivos, validación anti-NULL, límites de XP por ejercicio, concurrencia en conexiones independientes, consistencia de progreso y política de 0 XP).
* **Currículo Verificado:** Las 18 consultas del currículo oficial evaluadas y aprobadas (`18/18 PASSED`).
* **Compilación Frontend:** TypeScript estricto con `vite build` completado en 5.70s con 0 errores.
* **Integridad de Producción:** La rama `main` y el proyecto Supabase Cloud permanecen 100% inalterados.

---

## 2. Matriz de Hallazgos y Remediaciones Verificadas

| ID | Hallazgo Original | Estado Previo | Remediación Implementada y Verificada | Estado Final | Evidencia Automatizada |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **SEC-01** | Evasión de regex en SQL Runner mediante mutaciones en CTEs o literales con `;` | Vulnerabilidad Confirmada | Sustitución completa por análisis sintáctico de AST con **SQLGlot** (dialecto `postgres`). Inspección profunda de todo el árbol (`walk()`) para neutralizar mutaciones en subconsultas o CTEs. Contención de recursión con límites reales de PostgreSQL (`statement_timeout = 2000ms`, `work_mem = 16MB`). | **REMEDIADO** | `test_security.py` (23 pruebas: literales con `;`, `WITH RECURSIVE`, bloqueo de CTE mutante). |
| **SEC-02** | Autoridad vulnerable: Auto-adjudicación de XP y niveles desde el cliente web | Vulnerabilidad Confirmada | Creación de la función RPC `record_verified_attempt()` con `SECURITY DEFINER`, `SET search_path = ''`, bloqueo `SELECT ... FOR UPDATE`, índice único condicional y CLS que revoca `UPDATE` sobre `user_profiles(xp, level)` a clientes. | **REMEDIADO** | `test_supabase_migration.py` (`test_effective_privileges_matrix`, `test_rpc_validation_rejects_null_parameters`, `test_concurrent_same_exercise_independent_connections`). |
| **SEC-03** | Falta de autenticación en endpoints de ejecución del backend | Vulnerabilidad Confirmada | Módulo `app/core/auth.py` con validación asimétrica **ES256** vía endpoint JWKS público de Supabase (`/.well-known/jwks.json`). Modo invitado desacoplado para práctica sin persistencia ni XP. | **REMEDIADO** | `test_auth.py` (6 pruebas: tokens ES256 válidos, expirados, audience inválida, modo invitado). |
| **SEC-04** | Falsificación de intentos en `exercise_attempts` vía RLS | Vulnerabilidad Confirmada | Revocación total del permiso de `INSERT` sobre `exercise_attempts` para roles `anon` y `authenticated`. Eliminación de política RLS residual de inserción. Solo `service_role` (backend) puede registrar intentos. | **REMEDIADO** | `test_supabase_migration.py` (`test_effective_privileges_matrix`). |
| **SEC-05** | Exposición de puerto PostgreSQL Sandbox a `0.0.0.0:5433` | Riesgo de Despliegue | Vinculación estricta a `127.0.0.1:5433:5432` en [`docker-compose.yml`](file:///c:/Desarrollo/Qurio/docker-compose.yml). | **REMEDIADO** | Configuración de Docker Compose actualizada y verificada. |
| **SEC-06** | Falta de control de `lock_timeout` y archivos temporales en Sandbox | Deficiencia de Configuración | Incorporados `lock_timeout = '1000ms'` y `temp_file_limit = '32MB'` sobre el rol `readonly_student` en [`init.sql`](file:///c:/Desarrollo/Qurio/database/sandbox/init.sql). | **REMEDIADO** | Inicialización del rol en PostgreSQL Sandbox verificada. |
| **SEC-07** | Tolerancia excesiva en evaluación numérica y falta de validación pedagógica | Deficiencia Pedagógica / Calidad | **Evaluador de Dos Capas:** Capa 1 preserva tipos `Decimal` normalizados evitando redondeos de float IEEE 754; Capa 2 inspecciona el AST de la consulta para exigir funciones obligatorias como `ROUND()`. | **REMEDIADO** | `test_evaluator.py` (13 pruebas pasando: precisión Decimal exacta, tolerancia de escala, rechazo de consultas sin `ROUND`). |
| **SEC-08** | Inconsistencia de tipos en frontend entre estados de ejecución | Calidad / Tipado | Normalización a `executionStatus === 'SUCCESS'` en `ExerciseSpecPanel.tsx` y validación tipada con TypeScript `strict: true`. | **REMEDIADO** | Build de producción de Vite exitoso en 5.70s con 0 errores. |

---

## 3. Auditoría Exhaustiva de la Migración `03_security_hardening.sql` (v3.0)

El script [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) implementa las siguientes garantías técnicas:

### 3.1 Validación Estricta Anti-NULL y Defensiva
En PostgreSQL, expresiones booleanas como `IF p_status NOT IN ('PASSED', 'FAILED', 'ERROR')` evalúan a `NULL` (desconocido) cuando `p_status` es `NULL`, provocando que el bloque `IF` **no se ejecute**. Para neutralizar este riesgo:
* Cada parámetro es evaluado con `IS NULL` explícito antes de cualquier otra condición:
  ```sql
  IF p_user_id IS NULL OR p_exercise_id IS NULL THEN
      RAISE EXCEPTION 'user_id and exercise_id must not be null';
  END IF;

  IF p_status IS NULL OR p_status NOT IN ('PASSED', 'FAILED', 'ERROR') THEN
      RAISE EXCEPTION 'Invalid status: %. Must be PASSED, FAILED or ERROR', COALESCE(p_status, 'NULL');
  END IF;

  IF p_execution_time_ms IS NULL OR p_execution_time_ms < 0 THEN
      RAISE EXCEPTION 'execution_time_ms cannot be null or negative, got %', COALESCE(p_execution_time_ms::TEXT, 'NULL');
  END IF;

  IF p_hints_used IS NULL OR p_hints_used < 0 OR p_hints_used > 3 THEN
      RAISE EXCEPTION 'hints_used must be between 0 and 3, got %', COALESCE(p_hints_used::TEXT, 'NULL');
  END IF;

  IF p_xp_to_award IS NULL OR p_xp_to_award < 0 THEN
      RAISE EXCEPTION 'xp_to_award cannot be null or negative, got %', COALESCE(p_xp_to_award::TEXT, 'NULL');
  END IF;

  IF p_submitted_sql IS NULL OR pg_catalog.length(pg_catalog.btrim(p_submitted_sql)) = 0 THEN
      RAISE EXCEPTION 'submitted_sql cannot be null or empty';
  END IF;

  IF pg_catalog.length(p_submitted_sql) > 10000 THEN
      RAISE EXCEPTION 'submitted_sql exceeds maximum allowed size of 10000 characters';
  END IF;
  ```

### 3.2 Endurecimiento de `SECURITY DEFINER` con `SET search_path = ''`
* Se sustituyó `SET search_path = public, pg_temp` por `SET search_path = ''`.
* Esto neutraliza de forma absoluta los ataques de secuestro de esquemas (*search_path hijacking* o creación maliciosa de operadores/funciones en esquemas temporales).
* **Calificación Explícita de Objetos:**
  * Todas las tablas se invocan con prefijo: `public.user_profiles`, `public.exercise_attempts`, `public.exercises`, `public.user_progress`.
  * Funciones de catálogo del sistema: `pg_catalog.btrim()`, `pg_catalog.length()`, `pg_catalog.floor()`, `pg_catalog.timezone()`, `pg_catalog.now()`, `pg_catalog.jsonb_build_object()`.
  * Expresiones sintácticas SQL (`COALESCE`, `LEAST`, `GREATEST`, `COUNT`): Se ejecutan directamente bajo las reglas de la gramática de PostgreSQL sin depender de resolución de nombres de funciones en esquemas de usuario.

### 3.3 Autoridad sobre Identidad y Límites de XP
* El parámetro `p_user_id` recibido en FastAPI proviene **exclusivamente del claim `sub` del JWT validado asimétricamente vía JWKS**. No es aceptado desde cuerpos JSON no confiables del cliente.
* La función RPC **no confía ciegamente en `p_xp_to_award`**:
  ```sql
  SELECT e.module_id, e.xp_reward INTO v_module_id, v_base_xp
  FROM public.exercises e
  WHERE e.id = p_exercise_id;

  v_penalty_rate := LEAST(0.45, p_hints_used * 0.15);
  v_max_allowable_xp := GREATEST(10, pg_catalog.floor(v_base_xp * (1.0 - v_penalty_rate))::INT);

  IF p_xp_to_award > v_max_allowable_xp THEN
      RAISE EXCEPTION 'xp_to_award (%) exceeds maximum allowable XP (%) for exercise %',
          p_xp_to_award, v_max_allowable_xp, p_exercise_id;
  END IF;
  ```

### 3.4 Concurrencia e Idempotencia en Conexiones Independientes
1. **Bloqueo `SELECT ... FOR UPDATE` sobre `public.user_profiles`:** Serializa cualquier intento simultáneo del mismo usuario en el motor físico de la base de datos.
2. **Índice Único Parcial Físico:**
   ```sql
   CREATE UNIQUE INDEX IF NOT EXISTS idx_single_awarded_passed_attempt
       ON public.exercise_attempts (user_id, exercise_id)
       WHERE status = 'PASSED' AND xp_awarded > 0;
   ```
   Garantiza que físicamente es imposible que existan dos registros con XP otorgado para el mismo ejercicio y usuario.
3. **Regla Canónica de Primer Intento con 0 XP:** Si un usuario aprueba un ejercicio recibiendo 0 XP (ej. política formativa o penalización), el intento se registra como `PASSED` con `xp_awarded = 0`. Los intentos posteriores reconocen que el reto ya fue superado (`already_passed = TRUE`) y no permiten adjudicar XP tardío.

### 3.5 Consistencia de `user_progress` en Intentos FAILED y ERROR
Cuando un intento no es exitoso (`status IN ('FAILED', 'ERROR')`), la función no modifica las estadísticas ni el XP del usuario, pero consulta y retorna el estado auditado real actual de `public.user_progress` (número exacto de ejercicios aprobados y si el módulo está completado), impidiendo que errores de ejecución desincronicen el estado visual del cliente.

---

## 4. Matriz de Privilegios Efectivos de PostgreSQL

Se ejecutó el script [`database/supabase/diagnose_privileges.sql`](file:///c:/Desarrollo/Qurio/database/supabase/diagnose_privileges.sql) sobre el entorno de prueba local idéntico a Supabase, confirmando la siguiente matriz:

### 4.1 Privilegios a Nivel de Tabla (`has_table_privilege`)
| Tabla | Rol | SELECT | INSERT | UPDATE | DELETE | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `user_profiles` | `anon` | **TRUE** | FALSE | FALSE | FALSE | Solo lectura pública de perfiles |
| `user_profiles` | `authenticated` | **TRUE** | FALSE | FALSE | FALSE | Lectura de perfiles; UPDATE a nivel de tabla revocado |
| `user_profiles` | `service_role` | **TRUE** | **TRUE** | **TRUE** | **TRUE** | Control total de backend |
| `exercise_attempts` | `anon` | FALSE | FALSE | FALSE | FALSE | Acceso denegado |
| `exercise_attempts` | `authenticated` | **TRUE** | **FALSE** | FALSE | FALSE | **Lectura personal vía RLS; INSERT directo BLOQUEADO** |
| `exercise_attempts` | `service_role` | **TRUE** | **TRUE** | **TRUE** | **TRUE** | Certificación autorizada |
| `user_progress` | `anon` | FALSE | FALSE | FALSE | FALSE | Acceso denegado |
| `user_progress` | `authenticated` | **TRUE** | FALSE | FALSE | FALSE | Lectura personal vía RLS |
| `user_progress` | `service_role` | **TRUE** | **TRUE** | **TRUE** | **TRUE** | Actualizado por la RPC |

### 4.2 Privilegios a Nivel de Columna (CLS) sobre `user_profiles` para `authenticated`
| Columna | can_select | can_update | Justificación de Seguridad |
| :--- | :---: | :---: | :--- |
| `id` | **TRUE** | **FALSE** | Identificador inmutable derivado de `auth.users` |
| `username` | **TRUE** | **FALSE** | Nombre de usuario inmutable por cliente directo |
| `display_name` | **TRUE** | **TRUE** | Edición de perfil permitida al usuario |
| `avatar_url` | **TRUE** | **TRUE** | Edición de avatar permitida al usuario |
| `bio` | **TRUE** | **TRUE** | Edición de biografía permitida al usuario |
| `level` | **TRUE** | **FALSE** | **BLINDADO: Calculado exclusivamente por RPC backend** |
| `xp` | **TRUE** | **FALSE** | **BLINDADO: Otorgado exclusivamente por RPC backend** |
| `current_streak_days`| **TRUE** | **FALSE** | Calculado por el motor de actividad diaria |
| `max_streak_days` | **TRUE** | **FALSE** | Récord inmutable por cliente |
| `created_at` | **TRUE** | **FALSE** | Timestamp de auditoría del sistema |
| `updated_at` | **TRUE** | **TRUE** | Actualizado al modificar campos visuales |

### 4.3 Privilegios de Ejecución de la Función RPC (`has_function_privilege`)
| Rol | Privilegio `EXECUTE` | Estado |
| :--- | :---: | :--- |
| `PUBLIC` | **FALSE** | Revocado explícitamente |
| `anon` | **FALSE** | Revocado explícitamente |
| `authenticated` | **FALSE** | **Revocado explícitamente (Clientes REST no pueden invocarla)** |
| `service_role` | **TRUE** | **Exclusivo para el backend de Qurio** |

---

## 5. Pruebas Automatizadas de Concurrencia e Integridad (`test_supabase_migration.py`)

Se diseñó la suite automatizada [`apps/api/tests/test_supabase_migration.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_supabase_migration.py) que recrea en Docker las condiciones exactas de Supabase Cloud. Los 7 casos de prueba pasaron con éxito:

```text
apps\api\tests\test_supabase_migration.py::test_effective_privileges_matrix PASSED [ 14%]
apps\api\tests\test_supabase_migration.py::test_rpc_validation_rejects_null_parameters PASSED [ 28%]
apps\api\tests\test_supabase_migration.py::test_rpc_validation_rejects_xp_exceeding_exercise_reward PASSED [ 42%]
apps\api\tests\test_supabase_migration.py::test_concurrent_same_exercise_independent_connections PASSED [ 57%]
apps\api\tests\test_supabase_migration.py::test_concurrent_different_exercises_no_lost_updates PASSED [ 71%]
apps\api\tests\test_supabase_migration.py::test_user_progress_consistency_on_failed_and_error PASSED [ 85%]
apps\api\tests\test_supabase_migration.py::test_first_pass_with_zero_xp_counts_as_passed PASSED [100%]
============================== 7 passed in 0.82s ==============================
```

### Detalle de las Pruebas de Concurrencia con Conexiones Independientes:
1. **Mismo Ejercicio en Paralelo (`test_concurrent_same_exercise_independent_connections`):**
   * Dos conexiones de red asyncpg independientes intentan registrar `PASSED` para el mismo usuario y ejercicio simultáneamente (`asyncio.gather`).
   * **Resultado:** La primera conexión obtiene `xp_awarded = 30` y `already_passed = FALSE`. La segunda conexión es bloqueada en `FOR UPDATE`, se serializa y retorna `xp_awarded = 0` con `already_passed = TRUE`.
   * El perfil del usuario tiene exactamente `30 XP` (no 60 XP).
   * La tabla `exercise_attempts` contiene 2 registros auditables, pero exactamente 1 con `xp_awarded = 30`.
2. **Diferentes Ejercicios en Paralelo (`test_concurrent_different_exercises_no_lost_updates`):**
   * Dos conexiones independientes registran la finalización simultánea del Ejercicio 1 (30 XP) y el Ejercicio 8 (30 XP) del Módulo 1.
   * **Resultado:** Cero pérdidas de actualización (*no lost updates*). El XP final del perfil es exactamente `60 XP` (`level = 1`), y `public.user_progress` registra `exercises_completed_count = 2` y `is_completed = TRUE`.

---

## 6. Procedimiento Previo de Detección de Duplicados Históricos

Antes de aplicar la migración en Supabase Cloud, debe ejecutarse la siguiente consulta de diagnóstico en el SQL Editor de Supabase:

```sql
SELECT user_id, exercise_id, COUNT(*) AS duplicados,
       ARRAY_AGG(id ORDER BY created_at ASC) AS attempt_ids,
       ARRAY_AGG(xp_awarded ORDER BY created_at ASC) AS xp_historico
FROM public.exercise_attempts
WHERE status = 'PASSED' AND xp_awarded > 0
GROUP BY user_id, exercise_id
HAVING COUNT(*) > 1;
```

### Procedimiento de Resolución en Caso de Existir Filas:
Si la consulta arroja duplicados previos generados antes de la Fase 9:
1. Conservar el registro más antiguo (`attempt_ids[1]`) con su `xp_awarded` original.
2. Actualizar los registros duplicados posteriores a `xp_awarded = 0`:
   ```sql
   UPDATE public.exercise_attempts
   SET xp_awarded = 0
   WHERE id IN (
       -- IDs de intentos duplicados posteriores
   );
   ```
3. Recalcular el XP acumulado en `public.user_profiles` sumando el `xp_awarded` consolidado.
4. Proceder con la creación del índice `idx_single_awarded_passed_attempt`.

---

## 7. Procedimiento de Rollback Seguro

En cumplimiento de las directrices de seguridad, el script de reversión [`database/supabase/rollback_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/rollback_security_hardening.sql) **no restaura permisos amplios e inseguros** (`GRANT UPDATE ON user_profiles TO authenticated` queda estrictamente prohibido):

```sql
-- =============================================================================
-- Qurio: Procedimiento de Reversión Seguro (Rollback Seguro Fase 9)
-- Archivo: database/supabase/rollback_security_hardening.sql
-- =============================================================================

-- 1. Eliminar la función RPC record_verified_attempt
DROP FUNCTION IF EXISTS public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
);

-- 2. Eliminar el índice condicional anti-duplicados
DROP INDEX IF EXISTS public.idx_single_awarded_passed_attempt;

-- 3. Estado Seguro de public.user_profiles
-- Se mantienen revocados los permisos amplios sobre user_profiles.
-- Los roles de cliente (authenticated, anon, PUBLIC) NO reciben UPDATE sobre xp ni level.
REVOKE ALL ON TABLE public.user_profiles FROM PUBLIC, anon;
REVOKE UPDATE, INSERT, DELETE, TRUNCATE ON TABLE public.user_profiles FROM authenticated;
REVOKE UPDATE (id, username, level, xp, current_streak_days, max_streak_days, created_at)
    ON public.user_profiles FROM authenticated, anon, PUBLIC;

-- Solo se permite lectura y actualización de campos visuales inocuos
GRANT SELECT ON TABLE public.user_profiles TO authenticated, anon;
GRANT UPDATE (display_name, avatar_url, bio, updated_at)
    ON public.user_profiles TO authenticated;

-- 4. Estado de Transición para public.exercise_attempts
-- Si se requiere restaurar la inserción directa por contingencia técnica:
-- Se restaura la política RLS y el permiso de inserción restringido a columnas operativas,
-- pero EXCLUYENDO explícitamente xp_awarded para mitigar fraude directo.
GRANT SELECT ON TABLE public.exercise_attempts TO authenticated;
GRANT INSERT (user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used)
    ON public.exercise_attempts TO authenticated;

CREATE POLICY "User Insert Own Attempts" ON public.exercise_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Estado Exacto Post-Rollback:
* `user_profiles.xp` y `user_profiles.level` permanecen blindados contra escrituras arbitrarias de clientes.
* El frontend no puede auto-adjudicarse XP.
* Los intentos de ejercicio pueden registrarse transicionalmente con validación RLS sin capacidad de alterar balances de gamificación.

---

## 8. Análisis de Riesgos Residuales

Tras la implementación de la Fase 9, los riesgos identificados en la auditoría inicial han sido mitigados o acotados a límites operacionales aceptables:

1. **Gestión de la Credencial `SUPABASE_SERVICE_ROLE_KEY`:**
   * *Riesgo:* Exposición accidental de la clave secreta de administración de Supabase.
   * *Mitigación:* Se almacena exclusivamente en variables de entorno del servidor backend (`apps/api/.env`). El archivo `.gitignore` bloquea su inclusión en el repositorio. El frontend (`apps/web`) utiliza únicamente la clave pública anónima `VITE_SUPABASE_ANON_KEY`.
2. **Entorno Sandbox Multi-Inquilino sin Docker Dinámico por Usuario:**
   * *Riesgo:* Los estudiantes comparten la base de datos de solo lectura `ecommerce_sandbox`.
   * *Mitigación:* El rol `readonly_student` tiene revocado `CREATE` y `TEMP`, `statement_timeout = 2000ms`, `lock_timeout = 1000ms`, `work_mem = 16MB` y `temp_file_limit = 32MB`. Las transacciones son forzadas en modo `READ ONLY`. El semáforo de FastAPI limita la concurrencia a 10 consultas simultáneas por nodo.
3. **Escalabilidad de Rate Limiting en Despliegues Multi-Instancia:**
   * *Riesgo:* En el entorno de desarrollo local, los contadores de rate limiting residen en memoria dentro del proceso de FastAPI.
   * *Mitigación:* La arquitectura en `app/core/rate_limit.py` está desacoplada mediante interfaz de adaptador. Para entornos de producción con múltiples réplicas de FastAPI, el adaptador conectará con Redis configurando la variable `REDIS_URL`.

---

## 9. Estado del Repositorio y Próximos Pasos

* **Rama Git de Trabajo:** `security/phase-9-hardening`
* **Rama Principal (`main`):** Protegida, limpia y sin alteraciones.
* **Compromiso Estricto:**
  * **NO se ejecutará `03_security_hardening.sql` en Supabase Cloud** hasta que el usuario revise este informe y otorgue su autorización explícita.
  * **NO se realizará `merge` a `main` ni despliegue automático.**
