# Informe de Resultados de Remediación y Hardening de Seguridad (Fase 9) — Qurio

**Fecha:** 9 de Noviembre de 2026  
**Versión:** 4.0 (Auditoría Final Estricta: Corrección de XP Autoritativo sin Mínimo Artificial, Blindaje CLS Total, Rollback Seguro y aclexplode para PUBLIC)  
**Rama Git:** `security/phase-9-hardening`  
**Estado:** Implementación Local y Validación Automatizada Concluidas al 100% (**NO se ejecutará en Supabase Cloud sin autorización explícita del usuario**)  
**Autores:** Equipo Multidisciplinario de PostgreSQL Database Security, AppSec, Supabase Security y QA de Qurio  

---

## 1. Resumen Ejecutivo

En atención a la revisión final de seguridad previa a considerar la migración candidata a producción, se resolvieron las cuatro cuestiones técnicas y la auditoría de conciliación de datos solicitadas para la **Fase 9: Hardening de Seguridad**. La plataforma **Qurio** implementa ahora una arquitectura de **defensa en profundidad estricta** en todas sus capas:

### Indicadores Clave de Calidad y Seguridad
* **Batería Completa de Pruebas Automatizadas:** **64 de 64 pruebas pasando exitosamente en 3.76s** (`64/64 PASSED`):
  * `test_security.py`: 23/23 pruebas (AST con SQLGlot, prevención de SQLi, contención de CTEs recursivos con límites nativos, validación de las 18 consultas del currículo).
  * `test_evaluator.py`: 14/14 pruebas (Evaluador semántico de dos capas: exactitud `Decimal` sin colapso IEEE 754, inspector didáctico de AST para `ROUND()`, y cálculo proporcional de XP sin mínimos artificiales en 0, 5, 10, 20 y 100 XP).
  * `test_supabase_migration.py`: 9/9 pruebas (Matriz de privilegios efectivos CLS a nivel de tabla y columna, validación anti-NULL, cálculo autoritativo de XP, concurrencia en conexiones independientes sin race conditions ni lost updates, consistencia de progreso y prueba de reversión segura).
  * `test_auth.py`: 6/6 pruebas (Autenticación asimétrica ES256 vía JWKS, expiración, audience y modo invitado aislado).
  * `test_integration.py`: 11/11 pruebas (Flujo integral de endpoints, contratos de API y manejo de errores).
  * `test_rate_limit.py`: 1/1 prueba (Rate limiting en memoria por IP/Usuario y semáforo de concurrencia).
* **Compilación Frontend:** TypeScript estricto con `vite build` completado en 5.86s con 0 errores.
* **Integridad de Producción:** La rama `main` y el proyecto Supabase Cloud permanecen 100% intactos sin alteraciones.

---

## 2. Resolución de las Cuestiones Técnicas Requeridas

### 2.1 Corrección del Cálculo de XP (Eliminación del Mínimo Artificial)
* **Deficiencia Previa:** La fórmula `GREATEST(10, FLOOR(v_base_xp * (1.0 - v_penalty_rate))::INT)` provocaba que ejercicios con base de 0 XP o 5 XP concedieran 10 XP, sobre-recompensando retos por encima de su valor real.
* **Remediación Implementada:**
  1. Se eliminó el mínimo artificial de 10 XP tanto en PostgreSQL [`03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) como en Python [`evaluator.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/evaluator.py).
  2. Validación estricta en base de datos: se verifica que `e.xp_reward` no sea NULL ni negativo (`IF v_base_xp IS NULL OR v_base_xp < 0 THEN RAISE EXCEPTION ...`).
  3. Cálculo autoritativo puro:
     ```sql
     v_penalty_rate := LEAST(0.45, GREATEST(0.0, p_hints_used * 0.15));
     v_authoritative_xp := LEAST(v_base_xp, GREATEST(0, pg_catalog.floor(v_base_xp * (1.0 - v_penalty_rate))::INT));
     ```
  4. **Validación Defensiva del Parámetro `p_xp_to_award`:**
     * Se preserva en la firma de la RPC por contrato de API y registro auditable entre backend y base de datos.
     * La RPC valida que `p_xp_to_award <= v_authoritative_xp`. Si el llamador solicita más XP que el cálculo oficial, la transacción es abortada inmediatamente.
     * Si `p_xp_to_award = 0` (modo práctica o prueba formativa sin puntos), la RPC respeta los 0 XP.
* **Comportamiento Verificado en Pruebas:**
  * Base 0 XP: otorga 0 XP con 0, 1, 2 o 3 pistas. Intentos de adjudicar > 0 XP son rechazados.
  * Base 5 XP: 0 pistas = 5 XP, 1 pista = 4 XP, 2 pistas = 3 XP, 3 pistas = 2 XP.
  * Base 10 XP: 0 pistas = 10 XP, 1 pista = 8 XP, 2 pistas = 7 XP, 3 pistas = 5 XP.
  * Base 20 XP: 0 pistas = 20 XP, 1 pista = 17 XP, 2 pistas = 14 XP, 3 pistas = 11 XP.
  * Base 100 XP: 0 pistas = 100 XP, 1 pista = 85 XP, 2 pistas = 70 XP, 3 pistas = 55 XP.

---

### 2.2 Blindaje Exhaustivo de Privilegios en `public.exercise_attempts`
* **Deficiencia Previa:** Asumir que `REVOKE ALL ON TABLE` eliminaba permisos residuales a nivel de columna otorgados previamente.
* **Remediación Implementada en `03_security_hardening.sql`:**
  1. Revocación total a nivel de tabla:
     ```sql
     REVOKE ALL ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;
     REVOKE DELETE, TRUNCATE ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;
     ```
  2. Revocación explícita por columna en **todas las 10 columnas** de `exercise_attempts`:
     ```sql
     REVOKE INSERT (id, user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used, xp_awarded, created_at)
         ON public.exercise_attempts FROM PUBLIC, anon, authenticated;

     REVOKE UPDATE (id, user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used, xp_awarded, created_at)
         ON public.exercise_attempts FROM PUBLIC, anon, authenticated;
     ```
  3. Eliminación permanente de la política RLS residual:
     ```sql
     DROP POLICY IF EXISTS "User Insert Own Attempts" ON public.exercise_attempts;
     ```
  4. Solo lectura personal para el estudiante (`GRANT SELECT TO authenticated` vía RLS).
  5. Escritura y certificación reservadas **exclusivamente para `service_role`**.

---

### 2.3 Corrección del Procedimiento de Rollback
* **Deficiencia Previa:** El rollback anterior restauraba `GRANT INSERT (...) ON exercise_attempts TO authenticated` y recreaba la política `"User Insert Own Attempts"`, reabriendo la vulnerabilidad de falsificación directa de intentos con `status='PASSED'`.
* **Remediación Implementada en `rollback_security_hardening.sql`:**
  1. **Se eliminó por completo cualquier restauración de permisos de inserción para clientes.**
  2. El rollback garantiza de forma inmutable:
     * Columnas `xp` y `level` protegidas contra escrituras de clientes (`authenticated` solo puede actualizar campos de perfil visual).
     * `exercise_attempts` blindada: clientes tienen 0 permisos de inserción y 0 permisos de modificación.
     * Cero políticas permisivas de inserción directa.
  3. **Procedimiento de Contingencia Operacional Documentado:**
     * Si la RPC es retirada por contingencia técnica, la certificación de intentos queda a cargo del backend FastAPI mediante consultas parametrizadas con `service_role`.
     * Si el backend entra en mantenimiento, la plataforma opera en modo de práctica interactiva pura en memoria, sin persistencia en la nube.
     * **Bajo ninguna circunstancia se delega la inserción al frontend web.**
  4. **Verificación Automatizada:** El test `test_rollback_script_preserves_strict_security` ejecuta el rollback y comprueba que `authenticated` recibe `InsufficientPrivilegeError` al intentar insertar en `exercise_attempts` o actualizar `user_profiles.xp`.

---

### 2.4 Corrección del Diagnóstico de PUBLIC mediante `aclexplode`
* **Deficiencia Previa:** El script anterior usaba `has_function_privilege('public', ...)`, lo cual falla en PostgreSQL porque `PUBLIC` es una palabra clave de pseudo-rol, no un rol estándar en `pg_roles`.
* **Remediación Implementada en `diagnose_privileges.sql`:**
  1. Uso de la función del sistema `aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner)))` sobre `pg_proc`:
     * En PostgreSQL, el grantee `0` representa explícitamente a `PUBLIC`.
     * La consulta desglosa cada entrada de la lista de control de acceso (ACL):
       ```sql
       SELECT
           p.proname AS function_name,
           a.grantor::regrole::text AS grantor,
           CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END AS grantee,
           a.privilege_type,
           a.is_grantable
       FROM pg_proc p
       CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
       WHERE p.proname = 'record_verified_attempt'
         AND p.pronamespace = 'public'::regnamespace;
       ```
  2. **Resultado Real del Diagnóstico:**
     * `grantee: postgres` (propietario)
     * `grantee: service_role` (autorizado)
     * **`PUBLIC` (grantee 0) NO existe en la ACL**, confirmando la revocación absoluta.
  3. Comprobación directa para los roles estándar (`anon: False`, `authenticated: False`, `service_role: True`).

---

### 2.5 Conciliación Segura de XP Histórico (Multi-Fuente)
* **Directriz Estricta:** **NO MODIFICAR DATOS HISTÓRICOS AUTOMÁTICAMENTE**.
* **Análisis de Fuentes de Gamificación en Qurio:**
  En el esquema oficial de Qurio ([`01_schema.sql`](file:///c:/Desarrollo/Qurio/database/supabase/01_schema.sql)), el XP acumulado de un estudiante (`user_profiles.xp`) se compone de:
  1. **Intentos de Ejercicios:** `public.exercise_attempts.xp_awarded`.
  2. **Logros Desbloqueados:** `public.user_achievements` vinculado a `public.achievements.xp_reward` (100 XP base por logro).
  3. **Actividad y Rachas Diarias:** `public.user_daily_activity.xp_earned`.
  Recalcular `user_profiles.xp` sumando únicamente los intentos de ejercicios borraría injustamente el XP legítimo acumulado por logros y rachas.
* **Consulta de Auditoría Diagnóstica Previa:**
  Se incluyó en `03_security_hardening.sql` y `diagnose_privileges.sql`:
  ```sql
  SELECT
      up.id AS user_id,
      up.username,
      up.xp AS current_profile_xp,
      COALESCE(ea.xp_from_attempts, 0) AS xp_from_attempts,
      COALESCE(ach.xp_from_achievements, 0) AS xp_from_achievements,
      COALESCE(act.xp_from_daily_activity, 0) AS xp_from_daily_activity,
      (COALESCE(ea.xp_from_attempts, 0) + COALESCE(ach.xp_from_achievements, 0) + COALESCE(act.xp_from_daily_activity, 0)) AS total_audited_xp,
      up.xp - (COALESCE(ea.xp_from_attempts, 0) + COALESCE(ach.xp_from_achievements, 0) + COALESCE(act.xp_from_daily_activity, 0)) AS discrepancy
  FROM public.user_profiles up
  LEFT JOIN (
      SELECT user_id, SUM(xp_awarded) AS xp_from_attempts
      FROM public.exercise_attempts
      WHERE status = 'PASSED'
      GROUP BY user_id
  ) ea ON ea.user_id = up.id
  LEFT JOIN (
      SELECT ua.user_id, SUM(a.xp_reward) AS xp_from_achievements
      FROM public.user_achievements ua
      JOIN public.achievements a ON a.id = ua.achievement_id
      GROUP BY ua.user_id
  ) ach ON ach.user_id = up.id
  LEFT JOIN (
      SELECT user_id, SUM(xp_earned) AS xp_from_daily_activity
      FROM public.user_daily_activity
      GROUP BY user_id
  ) act ON act.user_id = up.id
  ORDER BY discrepancy DESC;
  ```
  Esta consulta permite inspeccionar cualquier discrepancia antes de cualquier acción administrativa, protegiendo todos los saldos legítimos.

---

## 3. Matriz de Privilegios Efectivos Auditada

A continuación se presenta la matriz de privilegios efectiva verificada contra el catálogo de PostgreSQL:

### 3.1 Privilegios a Nivel de Tabla (`has_table_privilege`)
| Tabla | Rol | SELECT | INSERT | UPDATE | DELETE | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `user_profiles` | `anon` | **TRUE** | FALSE | FALSE | FALSE | Lectura pública de perfiles |
| `user_profiles` | `authenticated` | **TRUE** | FALSE | FALSE | FALSE | UPDATE a nivel de tabla revocado |
| `user_profiles` | `service_role` | **TRUE** | **TRUE** | **TRUE** | **TRUE** | Control administrativo |
| `exercise_attempts` | `anon` | FALSE | FALSE | FALSE | FALSE | Acceso denegado |
| `exercise_attempts` | `authenticated` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | Lectura personal RLS; **Escritura BLOQUEADA** |
| `exercise_attempts` | `service_role` | **TRUE** | **TRUE** | **TRUE** | **TRUE** | Certificación autorizada |

### 3.2 Privilegios a Nivel de Columna (CLS) en `public.exercise_attempts`
| Columna | auth_can_select | auth_can_insert | auth_can_update | anon_can_select | anon_can_insert |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `id` | **TRUE** | **FALSE** | **FALSE** | FALSE | FALSE |
| `user_id` | **TRUE** | **FALSE** | **FALSE** | FALSE | FALSE |
| `exercise_id` | **TRUE** | **FALSE** | **FALSE** | FALSE | FALSE |
| `submitted_sql` | **TRUE** | **FALSE** | **FALSE** | FALSE | FALSE |
| `status` | **TRUE** | **FALSE** | **FALSE** | FALSE | FALSE |
| `execution_time_ms` | **TRUE** | **FALSE** | **FALSE** | FALSE | FALSE |
| `error_message` | **TRUE** | **FALSE** | **FALSE** | FALSE | FALSE |
| `hints_used` | **TRUE** | **FALSE** | **FALSE** | FALSE | FALSE |
| `xp_awarded` | **TRUE** | **FALSE** | **FALSE** | FALSE | FALSE |
| `created_at` | **TRUE** | **FALSE** | **FALSE** | FALSE | FALSE |

---

## 4. Evidencia Automatizada de Pruebas

Se ejecutó la batería completa de pruebas del backend en el entorno local:

```text
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.2.0, pluggy-1.7.0
rootdir: C:\Desarrollo\Qurio\apps\api
configfile: pytest.ini
collected 64 items

apps\api\tests\test_auth.py ......                                       [  9%]
apps\api\tests\test_evaluator.py ..............                          [ 31%]
apps\api\tests\test_integration.py ...........                           [ 48%]
apps\api\tests\test_rate_limit.py .                                      [ 50%]
apps\api\tests\test_security.py .......................                  [ 85%]
apps\api\tests\test_supabase_migration.py .........                      [100%]

============================= 64 passed in 3.76s ==============================
```

### Casos Específicos Demostrados en `test_supabase_migration.py`:
1. `test_effective_privileges_matrix`: Valida CLS en todas las columnas de `user_profiles` y `exercise_attempts`, intentos reales bloqueados con `InsufficientPrivilegeError`, y auditoría de `aclexplode` demostrando ausencia de `PUBLIC`.
2. `test_rpc_validation_rejects_null_parameters`: Rechaza explícitamente parámetros `NULL` (`user_id`, `exercise_id`, `status`, `execution_time_ms`, `hints_used`, `xp_to_award`, `submitted_sql`).
3. `test_rpc_validation_rejects_xp_exceeding_exercise_reward`: Rechaza solicitudes con XP superior a la cota oficial.
4. `test_authoritative_xp_calculation_across_rewards_and_hints`: Valida el cálculo autoritativo proporcional para 0, 5, 10, 20 y 100 XP con 0 a 3 pistas, demostrando la eliminación del mínimo artificial de 10 XP.
5. `test_concurrent_same_exercise_independent_connections`: Conexiones `asyncpg` paralelas para el mismo ejercicio acreditan exactamente 30 XP una sola vez mediante `FOR UPDATE` e índice condicional.
6. `test_concurrent_different_exercises_no_lost_updates`: Conexiones paralelas para diferentes ejercicios acreditan 65 XP acumulados sin actualizaciones perdidas y completan el módulo.
7. `test_user_progress_consistency_on_failed_and_error`: Intentos `FAILED` o `ERROR` no corrompen ni desincronizan el progreso del módulo.
8. `test_first_pass_with_zero_xp_counts_as_passed`: Aprobación con 0 XP queda registrada como superada e impide acreditación duplicada posterior.
9. `test_rollback_script_preserves_strict_security`: El script de reversión elimina la RPC y el índice pero mantiene bloqueados de forma estricta los permisos de inserción y actualización para clientes.

---

## 5. Entregables Actualizados y Estado de Control de Versiones

1. [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) (v4.0):
   * Diagnóstico multi-fuente de XP sin alteración de datos.
   * Blindaje CLS exhaustivo en tabla y columnas de `exercise_attempts` y `user_profiles`.
   * RPC con `SET search_path = ''` y cálculo autoritativo de XP sin mínimo artificial.
   * Propietario `postgres`, permisos exclusivos para `service_role`.
2. [`database/supabase/rollback_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/rollback_security_hardening.sql) (v2.0):
   * Reversión segura que nunca concede `INSERT` en `exercise_attempts` ni `UPDATE` en `xp/level`.
   * Procedimiento de contingencia operacional documentado.
3. [`database/supabase/diagnose_privileges.sql`](file:///c:/Desarrollo/Qurio/database/supabase/diagnose_privileges.sql) (v2.0):
   * Inspección ACL con `aclexplode` para comprobar `PUBLIC` (grantee 0).
   * Inspección de todas las columnas de `exercise_attempts` y `user_profiles`.
   * Consulta de conciliación multi-fuente de XP sin modificación de datos.
4. [`apps/api/tests/test_supabase_migration.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_supabase_migration.py):
   * 9 pruebas automatizadas con Docker, RLS y conexiones paralelas.
5. [`apps/api/tests/test_evaluator.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_evaluator.py):
   * Prueba `test_evaluator_xp_scales_without_artificial_minimum` agregada.
6. [`apps/api/app/modules/runner/evaluator.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/evaluator.py):
   * Cálculo de XP proporcional unificado con la base de datos.
7. [`docs/BITACORA.md`](file:///c:/Desarrollo/Qurio/docs/BITACORA.md):
   * Bitácora actualizada con la Entrada 27.
8. **Control de Versiones:**
   * Rama activa: `security/phase-9-hardening` (sincronizada en remoto).
   * Rama `main`: Intacta, protegida.
   * Supabase Cloud: Cero modificaciones remotas.
