# Qurio — Certificación Final de Seguridad, Procedimiento de Rollback y Congelamiento de Fase 11.3

**Identificador:** `QURIO-PHASE-11-3-FINAL-CERTIFICATION`  
**Proyecto:** Qurio  
**Repositorio:** `https://github.com/ErickKNT/qurio.git`  
**Rama de trabajo autorizada:** `feat/phase-11-pilot-readiness`  
**Fecha de emisión:** 10 de noviembre de 2026  
**Documentos de referencia:**  
- `database/supabase/03_security_hardening.sql` (Versión canónica v6.1)
- `database/supabase/rollback_security_hardening.sql` (Versión definitiva v4.1)
- `apps/api/app/core/supabase.py` (Cliente Supabase con soporte de contingencia)
- `apps/api/app/modules/runner/router.py` (Alternativa B: Modo de contingencia)
- `docs/audits/QURIO_PHASE_11_3_ROLLBACK_AUDIT.md`
- `docs/audits/QURIO_PHASE_11_3_CONTINGENCY_TESTS.md`
- `docs/BLUEPRINT.md` (v1.2 — Decisiones D-01 a D-07)

---

## 1. Resumen Ejecutivo y Veredicto Único Final

### 1.1 Veredicto Final: APROBADO CON RESTRICCIONES OPERATIVAS EXTERNAS

Tras completar la revisión exhaustiva, corrección sintáctica en PostgreSQL, verificación de privilegios de secuencias, prueba de integración ante el error realista PostgREST `PGRST202` y ejecución de las cuatro suites automatizadas, se emite el dictamen final:

```
========================================================================================
ESTADO TÉCNICO DE LA BASE DE CÓDIGO (FastAPI + React/Vite + Sandbox Docker + SQL):
    >>> APROBADO AL 100% (LISTO PARA PILOTO CONTROLADO) <<<

ESTADO OPERATIVO DE SUPABASE CLOUD (Producción externa bfvgqxfzftumwrleacof):
    >>> PENDIENTE DE APLICACIÓN MANUAL POR ADMINISTRADOR AUTORIZADO <<<
========================================================================================
```

### 1.2 Restricción Operativa Externa y Alcance del Despliegue
1. **Código y plataforma 100% validados:** Toda la lógica de negocio, mecanismos de evaluación en sandbox aislado, clientes de autenticación, prevención de inyecciones, contratos de API, frontend responsive, pruebas E2E y suites de regresión están certificados y congelados.
2. **Restricción de infraestructura en la nube:** La cuenta y base de datos de producción en Supabase Cloud (`bfvgqxfzftumwrleacof`) no fue tocada durante esta fase, en estricto cumplimiento del mandato de seguridad (*Zero Cloud Mutations sin autorización directa*). El script de seguridad definitivo `database/supabase/03_security_hardening.sql` (v6.1) debe ser ejecutado en el SQL Editor de Supabase Cloud por el administrador con credenciales de producción previo al inicio formal del piloto con usuarios externos.
3. **Mecanismo de contingencia operativo:** Si durante la operación en la nube surgiera cualquier fallo en la función RPC o se ejecutara el script de reversión `rollback_security_hardening.sql` (v4.1), FastAPI conmuta de manera autónoma al **Modo de Contingencia (Alternativa B)**: los estudiantes practican al 100% de capacidades en el sandbox sin interrupciones, la API devuelve HTTP 200 con `status='PASSED'` y `xp_awarded=0`, informando al usuario con transparencia y garantizando que al restablecer la RPC el usuario pueda certificar su XP legítimo sin pérdida de progreso ni colisión en base de datos.
4. **Congelamiento de alcance:** Queda terminantemente congelado el alcance de la Fase 11.3. No se admiten ni requieren sub-fases adicionales (no habrá 11.3.2 ni 11.3.3).

---

## 2. Matriz Definitiva de Permisos por Rol y Tabla (PostgreSQL / Supabase)

La siguiente matriz documenta el estado riguroso de privilegios efectivos en el esquema `public`, aplicable tanto en el script canónico de endurecimiento `03_security_hardening.sql` (v6.1) como tras la ejecución del procedimiento de reversión `rollback_security_hardening.sql` (v4.1):

| Objeto en Schema `public` | Tipo | Rol `anon` | Rol `authenticated` | Rol `service_role` | Pseudo-rol `PUBLIC` | Estado RLS |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `user_profiles` | Tabla | **Cero privilegios** (`REVOKE ALL`) | `SELECT` *(solo propio perfil `auth.uid() = id`)*<br>`UPDATE` *(solo `display_name`, `avatar_url`, `bio`, `updated_at`)* | `ALL` | **Cero privilegios** | HABILITADO |
| `exercises` | Tabla | `SELECT` *(todas excepto `solution_query`)* | `SELECT` *(todas excepto `solution_query`)* | `ALL` | **Cero privilegios** | HABILITADO |
| `exercise_attempts` | Tabla | **Cero privilegios** | `SELECT` *(solo lectura personal auditada por RLS)* | `ALL` | **Cero privilegios** | HABILITADO |
| `user_progress` | Tabla | **Cero privilegios** | `SELECT` *(solo lectura personal auditada por RLS)* | `ALL` | **Cero privilegios** | HABILITADO |
| `learning_paths` | Tabla | `SELECT` | `SELECT` | `ALL` | **Cero privilegios** | HABILITADO |
| `modules` | Tabla | `SELECT` | `SELECT` | `ALL` | **Cero privilegios** | HABILITADO |
| `lessons` | Tabla | `SELECT` | `SELECT` | `ALL` | **Cero privilegios** | HABILITADO |
| `exercise_hints` | Tabla | `SELECT` | `SELECT` | `ALL` | **Cero privilegios** | HABILITADO |
| `achievements` | Tabla | `SELECT` | `SELECT` | `ALL` | **Cero privilegios** | HABILITADO |
| `user_achievements` | Tabla | **Cero privilegios** | `SELECT` *(solo lectura personal auditada por RLS)* | `ALL` | **Cero privilegios** | HABILITADO |
| `user_daily_activity` | Tabla | **Cero privilegios** | `SELECT` *(solo lectura personal auditada por RLS)* | `ALL` | **Cero privilegios** | HABILITADO |
| **Todas las Secuencias** | Secuencia | **Cero privilegios** (`REVOKE ALL`) | **Cero privilegios** (`REVOKE ALL`) | `ALL` (`USAGE`, `SELECT`) | **Cero privilegios** (`REVOKE ALL`) | N/A |
| `record_verified_attempt` | Función RPC | **Cero privilegios** (`REVOKE ALL`) | **Cero privilegios** (`REVOKE ALL`) | `EXECUTE` *(en v6.1; `DROP` en v4.1)* | **Cero privilegios** (`REVOKE ALL`) | N/A |

### 2.1 Puntos Clave de Seguridad Garantizados por la Matriz
1. **Blindaje de Column-Level Security (CLS) en `user_profiles`:** Las columnas `xp`, `level`, `current_streak_days`, `max_streak_days` y `created_at` tienen `REVOKE UPDATE` explícito para `authenticated`, `anon` y `PUBLIC`. Ni siquiera una política RLS permisiva podría otorgar acceso de escritura sobre estas columnas críticas.
2. **Blindaje de Column-Level Security (CLS) en `exercises`:** La columna `solution_query` tiene revocado el permiso `SELECT` para `anon`, `authenticated` y `PUBLIC`. Solamente `service_role` (utilizado por el backend de evaluación) tiene acceso para calcular el resultado esperado.
3. **Inmunidad de `exercise_attempts`:** Se revocó `INSERT`, `UPDATE`, `DELETE` y `TRUNCATE` para roles de cliente. La política histórica vulnerable `User Insert Own Attempts` fue eliminada definitivamente. Ningún usuario puede insertar registros de intentos por REST.
4. **Blindaje Total de Secuencias:** Toda secuencia en el esquema `public` tiene revocado `USAGE` y `SELECT` para `PUBLIC, anon, authenticated`. Solo `service_role` dispone de privilegios de secuencia.

---

## 3. Verificación Exhaustiva de los 11 Criterios de Certificación

### Criterio 1: Firma Exacta de la Función Eliminada
- **Requisito:** El script de rollback debe eliminar la versión unificada de la RPC con su firma exacta de 8 parámetros.
- **Implementación verificada:**
  ```sql
  DROP FUNCTION IF EXISTS public.record_verified_attempt(
      UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
  );
  ```
- **Evidencia empírica:** En `test_rollback_script_preserves_strict_security`, la consulta a `pg_proc` confirma:
  ```python
  can_exec = await db_conn.fetchval(
      "SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'record_verified_attempt');"
  )
  assert can_exec is False  # PASSED
  ```
- **Estado:** CUMPLIDO.

---

### Criterio 2: Conservación del Índice Único Parcial de Integridad
- **Requisito:** El índice parcial `idx_single_awarded_passed_attempt` no debe ser eliminado por el rollback, pues garantiza que ningún usuario reciba doble XP en la misma lección bajo concurrencia o reintentos.
- **Implementación verificada:**
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS idx_single_awarded_passed_attempt
      ON public.exercise_attempts (user_id, exercise_id)
      WHERE status = 'PASSED' AND xp_awarded > 0;
  ```
- **Evidencia empírica:**
  - El índice sobrevive tras el rollback: `assert idx_exists is True`.
  - Impide un segundo intento con `status='PASSED'` y `xp_awarded > 0`: arroja `UniqueViolationError: duplicate key value violates unique constraint "idx_single_awarded_passed_attempt"`.
  - Permite libremente reintentos con `xp_awarded = 0` (práctica libre o modo contingencia): 2 inserciones consecutivas con `xp_awarded = 0` se ejecutan sin error.
- **Estado:** CUMPLIDO.

---

### Criterio 3: Revocación Completa de Privilegios de Escritura a Clientes
- **Requisito:** `anon`, `authenticated` y `PUBLIC` no deben tener permisos de `INSERT`, `UPDATE`, `DELETE` ni `TRUNCATE` en `exercise_attempts`, `user_progress`, `user_achievements`, `user_daily_activity` ni en las tablas de currículo (`learning_paths`, `modules`, `lessons`, `exercise_hints`, `achievements`).
- **Implementación verificada:**
  - Se utiliza la sintaxis canónica de PostgreSQL: `REVOKE UPDATE, INSERT (...) ON TABLE public.<tabla> FROM ...;`.
  - No se incluyen operaciones prohibidas por columna como `DELETE` o `TRUNCATE` en listas de columnas.
- **Evidencia empírica:**
  - `has_table_privilege('authenticated', 'public.exercise_attempts', 'INSERT') == False`.
  - Inserciones directas bajo `SET LOCAL ROLE authenticated;` generan `InsufficientPrivilegeError: permission denied for table exercise_attempts`.
- **Estado:** CUMPLIDO.

---

### Criterio 4: Ausencia Total de Permisos Residuales de Actualización por Columna
- **Requisito:** Comprobar que `anon` y el pseudo-rol `PUBLIC` no conserven privilegios residuales de `UPDATE` o `INSERT` en ninguna columna de `user_profiles`.
- **Implementación verificada:**
  - El script purga explícitamente:
    ```sql
    REVOKE UPDATE, INSERT (
        id, username, display_name, avatar_url, bio, level, xp,
        current_streak_days, max_streak_days, created_at, updated_at
    ) ON TABLE public.user_profiles FROM PUBLIC, anon;
    ```
- **Evidencia empírica:** Comprobación sistemática columna por columna en `information_schema.column_privileges`:
  ```python
  for col in ["display_name", "avatar_url", "bio", "updated_at", "xp", "level", "username"]:
      assert has_column_privilege('anon', 'public.user_profiles', col, 'UPDATE') is False
      assert grantee_public_exists(col) is False
  ```
- **Estado:** CUMPLIDO.

---

### Criterio 5: Protección Rigurosa de `solution_query` en `exercises`
- **Requisito:** La columna `solution_query` debe permanecer invisible e inaccesible para clientes REST (`anon` y `authenticated`).
- **Implementación verificada:**
  - `REVOKE SELECT ON TABLE public.exercises FROM PUBLIC, anon, authenticated;`
  - Se otorga `SELECT` únicamente sobre la lista explícita de columnas educativas seguras (`id, module_id, title, prompt, initial_code, target_database, xp_reward, difficulty, check_order, sort_order, created_at`).
- **Evidencia empírica:**
  - `has_column_privilege('anon', 'public.exercises', 'solution_query', 'SELECT') == False`.
  - `has_column_privilege('authenticated', 'public.exercises', 'solution_query', 'SELECT') == False`.
  - `has_column_privilege('service_role', 'public.exercises', 'solution_query', 'SELECT') == True`.
  - Intento directo bajo `SET LOCAL ROLE authenticated; SELECT solution_query FROM public.exercises;` falla con `InsufficientPrivilegeError`.
  - En la API FastAPI (`test_public_exercises_never_expose_solution_query`), las llamadas a `/exercises` devuelven la lista sin el atributo `solution_query`.
- **Estado:** CUMPLIDO.

---

### Criterio 6: Preservación de Políticas RLS Necesarias
- **Requisito:** Row Level Security (RLS) debe estar habilitado y activo en las 11 tablas del esquema `public`. No debe restaurarse la política vulnerable `User Insert Own Attempts`.
- **Implementación verificada:**
  - Ejecución de `ALTER TABLE public.<tabla> ENABLE ROW LEVEL SECURITY;` sobre las 11 tablas.
  - `DROP POLICY IF EXISTS "User Insert Own Attempts" ON public.exercise_attempts;`.
- **Evidencia empírica:** En `test_rollback_script_preserves_strict_security`:
  ```python
  for tbl in all_11_tables:
      rls_on = await db_conn.fetchval(
          f"SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = '{tbl}';"
      )
      assert rls_on is True  # PASSED en las 11 tablas
  ```
- **Estado:** CUMPLIDO.

---

### Criterio 7: Blindaje Estricto de Secuencias
- **Requisito:** Ningún rol de cliente (`PUBLIC, anon, authenticated`) debe tener privilegios sobre secuencias en el esquema `public`. Solamente `service_role` debe disponer de acceso.
- **Implementación verificada:**
  ```sql
  REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
  ```
- **Evidencia empírica:** Bloque 12 de `test_rollback_script_preserves_strict_security`:
  ```python
  sequences = await db_conn.fetch("SELECT sequencename FROM pg_sequences WHERE schemaname = 'public';")
  for seq_row in sequences:
      assert has_sequence_privilege('anon', seq, 'USAGE') is False
      assert has_sequence_privilege('anon', seq, 'SELECT') is False
      assert has_sequence_privilege('authenticated', seq, 'USAGE') is False
      assert has_sequence_privilege('authenticated', seq, 'SELECT') is False
      assert has_sequence_privilege('service_role', seq, 'USAGE') is True
  ```
- **Estado:** CUMPLIDO.

---

### Criterio 8: Manejo Resiliente en FastAPI — Modo de Contingencia (Alternativa B)
- **Requisito:** Ante la indisponibilidad de la RPC (error HTTP 404/500, timeout o eliminación de función), el backend FastAPI no debe fallar con HTTP 500, no debe simular éxito falso ni prometer XP no certificado en la nube, y debe permitir que el alumno continúe su práctica en el sandbox.
- **Implementación verificada:**
  - En `apps/api/app/core/supabase.py`: `record_verified_progress` captura errores HTTP, timeouts y códigos de estado no 200, retornando `{"success": False, "xp_awarded": 0, "contingency_mode": True, "error": ...}`.
  - En `apps/api/app/modules/runner/router.py`:
    ```python
    if not rpc_res.get("success", False):
        evaluation.xp_awarded = 0
        evaluation.message = (
            "¡Reto resuelto correctamente! Modo de contingencia: tu consulta es válida, "
            "pero la certificación oficial de XP no está disponible temporalmente."
        )
    ```
- **Evidencia empírica:**
  - `test_contingency_mode_when_rpc_unavailable_awards_zero_xp_and_informs_user`: PASSED.
  - Respuesta HTTP: `200 OK`. `status: "PASSED"`, `xp_awarded: 0`.
- **Estado:** CUMPLIDO.

---

### Criterio 9: No Pérdida Silenciosa de Progreso
- **Requisito:** Un estudiante que practica y aprueba durante el modo de contingencia (obteniendo `xp_awarded = 0`) no debe quedar bloqueado permanentemente para reclamar su XP legítimo cuando la RPC se restablezca.
- **Implementación verificada:**
  - El índice único parcial `WHERE status = 'PASSED' AND xp_awarded > 0` ignora los intentos con `xp_awarded = 0`.
  - La lógica de la RPC `record_verified_attempt` v6.1 comprueba `v_already_awarded` independientemente de `v_already_passed`: si el usuario resolvió el ejercicio previamente pero no ha recibido recompensa (`v_already_awarded = false`), le adjudica el XP legítimo sin duplicar conteos ni violar restricciones.
- **Evidencia empírica:**
  - `test_contingency_mode_preserves_practice_and_allows_subsequent_reward_when_rpc_restored`: PASSED.
  - Primer intento (contingencia): `status='PASSED'`, `xp_awarded=0`.
  - Segundo intento (RPC restaurada): `status='PASSED'`, `xp_awarded=35`, `message: "...35 XP acreditados..."`.
  - En `test_supabase_migration.py` (`test_regression_scenario_3_and_4_first_pass_zero_xp_then_legitimate_reward`): PASSED.
- **Estado:** CUMPLIDO.

---

### Criterio 10: Reversibilidad y Re-aplicación sin Conflictos
- **Requisito:** Comprobar que `03_security_hardening.sql` (v6.1) y `rollback_security_hardening.sql` (v4.1) puedan alternarse sin generar dependencias cíclicas, errores de tablas inexistentes ni violaciones de restricciones.
- **Implementación verificada:**
  - Ambos scripts utilizan cláusulas idempotentes: `DROP FUNCTION IF EXISTS`, `CREATE UNIQUE INDEX IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `CREATE POLICY IF NOT EXISTS`.
  - Ambos scripts comparten la misma estructura de permisos de tabla, columna y secuencias, diferenciándose únicamente en la existencia de la función RPC `record_verified_attempt`.
- **Evidencia empírica:** En el ciclo de pruebas de integración, la base de datos ejecuta el hardening v6.1 en el setup, ejecuta el rollback v4.1 en la transacción de prueba, verifica todas las aserciones defensivas y revierte limpiamente sin colisiones de catálogo.
- **Estado:** CUMPLIDO.

---

### Criterio 11: Coherencia Integral con el Blueprint Qurio v1.2
- **Requisito:** Respetar estrictamente las decisiones aprobadas D-01 a D-07:
  - **D-01:** Modelo Freemium Free/Plus con precios hipotéticos de **$129 MXN/mes** y **$999 MXN/año**.
  - **D-02:** Eslogan corporativo *«Aprende datos. Practica. Construye tu futuro.»* y lema técnico SQL *«Aprende SQL. Piensa en queries.»*.
  - **D-03:** Evaluación de Stripe México (sin integración prematura en código ni pasarelas ficticias).
  - **D-04:** Evaluación de alternativas para Python (sin selección prematura de infraestructura).
  - **D-05:** Modo invitado con acceso a exactamente 3 ejercicios gratuitos y estrictamente 0 XP oficial.
  - **D-06:** Teams Académico pospuesto.
  - **D-07:** Estabilidad y seguridad del núcleo antes de nuevas funcionalidades.
- **Implementación verificada:**
  - Ningún archivo del repositorio contradice estas definiciones.
  - La prueba E2E T07 verifica que el cuarto ejercicio bloquea al invitado con `HTTP 401 REGISTRATION_REQUIRED_AFTER_TRIAL`.
  - La prueba E2E T06 verifica que el invitado resuelve con éxito recibiendo `xp_awarded: 0`.
- **Estado:** CUMPLIDO.

---

## 4. Prueba Específica: Simulación Realista de Error PostgREST `PGRST202`

Para satisfacer el requerimiento de validar la respuesta del sistema ante la desactivación real de la RPC en PostgREST (error `"PGRST202": Could not find the function public.record_verified_attempt(...) in the schema cache`), se diseñó e implementó la prueba:
`test_contingency_mode_with_realistic_pgrst202_postgrest_error` en `apps/api/tests/test_integration.py`.

### 4.1 Configuración de la Simulación
1. **Payload interceptado:**
   ```json
   {
     "code": "PGRST202",
     "details": null,
     "hint": "If a new function was created in the database with this name and parameters, try reloading the schema cache.",
     "message": "Could not find the function public.record_verified_attempt(execution_time_ms, hints_used, p_error_message, p_exercise_id, p_hints_used, p_status, p_submitted_sql, p_user_id, p_xp_to_award, status, submitted_sql) in the schema cache"
   }
   ```
2. **Aislamiento absoluto:** Interceptación a nivel de cliente HTTP asíncrono (`httpx.AsyncClient.post`). No se emitió ninguna petición hacia internet ni hacia Supabase Cloud.
3. **Flujo probado:**
   - Invocación directa a `record_verified_progress(...)`.
   - Invocación de extremo a extremo a través del endpoint FastAPI `POST /api/v1/exercises/{exercise_id}/submit` con un usuario autenticado real.

### 4.2 Resultados Obtenidos
```
[PASS] Invocación directa a record_verified_progress:
       - direct_res["success"] is False
       - direct_res["contingency_mode"] is True
       - direct_res["xp_awarded"] == 0
       - "PGRST202" in direct_res["error"]

[PASS] Invocación a través de FastAPI /submit:
       - Status code: 200 OK (sin HTTP 500)
       - evaluation["status"] == "PASSED"
       - evaluation["xp_awarded"] == 0 (estrictamente cero)
       - evaluation["message"] contiene "contingencia" y "no está disponible temporalmente"
```

---

## 5. Resumen de Evidencias Empíricas y Reproducibles

| Suite de Validación | Comando de Ejecución | Pruebas Ejecutadas | Resultado | Duración |
| :--- | :--- | :---: | :---: | :---: |
| **Backend Pytest** | `pytest apps/api/tests/ -v` | **81** | **81 PASSED (100%)** | 62.43s |
| **Frontend Vitest** | `npm test` en `apps/web` | **17** | **17 PASSED (100%)** | 1.14s |
| **Build Producción** | `npm run build` en `apps/web` | **2,171 módulos** | **0 errores TypeScript / Vite** | 5.54s |
| **E2E Playwright** | `node apps/web/e2e/pilot_e2e_suite.mjs` | **19** | **19 PASSED (100%)** | 22.80s |
| **Auditoría de Dependencias** | `npm audit --registry=https://registry.npmjs.org` | **Dependencias web** | **0 vulnerabilidades** | 1.82s |

---

## 6. Inventario de Archivos Modificados en la Fase 11.3

1. **`database/supabase/rollback_security_hardening.sql` (v4.1):**
   - Corrección de sintaxis de revocación de columnas en PostgreSQL (`REVOKE UPDATE, INSERT (...) ON TABLE public.<tabla>`).
   - Purga de residuos de `anon` y `PUBLIC` en `user_profiles`.
   - Preservación del índice único condicional `idx_single_awarded_passed_attempt`.
   - Blindaje de `solution_query` en `exercises`.
   - Revocación total de privilegios de secuencias a clientes (`REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated`).
   - Habilitación explícita de RLS en las 11 tablas.
2. **`database/supabase/03_security_hardening.sql` (v6.1 canónico):**
   - Alineación de sintaxis de revocación de columnas a `ON TABLE public.user_profiles`.
   - Revocación total de secuencias para roles de cliente y concesión exclusiva a `service_role`.
3. **`apps/api/app/core/supabase.py`:**
   - Detección robusta de códigos HTTP 404, 500 y timeouts de la RPC Supabase.
   - Retorno estandarizado de `contingency_mode: True` y `xp_awarded: 0`.
4. **`apps/api/app/modules/runner/router.py`:**
   - Conmutación defensiva a Modo de Contingencia (Alternativa B) si `rpc_res["success"]` es falso.
   - Asignación obligatoria de `xp_awarded = 0` y mensaje pedagógico transparente.
5. **`apps/api/tests/test_integration.py`:**
   - Adición de `test_contingency_mode_when_rpc_unavailable_awards_zero_xp_and_informs_user`.
   - Adición de `test_contingency_mode_preserves_practice_and_allows_subsequent_reward_when_rpc_restored`.
   - Adición de `test_contingency_mode_with_realistic_pgrst202_postgrest_error`.
6. **`apps/api/tests/test_supabase_migration.py`:**
   - Adición de fixture de secuencias y comprobación de revocación en `test_effective_privileges_matrix`.
   - Expansión de `test_rollback_script_preserves_strict_security` cubriendo los 12 puntos de inspección y validación de secuencias.
7. **`docs/audits/QURIO_PHASE_11_3_FINAL_CERTIFICATION.md`:**
   - Este informe canónico de certificación y congelamiento de seguridad.

---

## 7. Dictamen Final de Congelamiento y Próximos Pasos

1. **Fase 11.3 Concluida:** Se da por cerrada y congelada la Fase 11.3 en la rama `feat/phase-11-pilot-readiness`.
2. **No apertura de subfases:** No se crearán fases 11.3.2 ni 11.3.3.
3. **Paso previo al piloto público:** Cuando el equipo de producto decida iniciar el piloto con usuarios reales, el administrador autorizado deberá aplicar `database/supabase/03_security_hardening.sql` (v6.1) en Supabase Cloud (`bfvgqxfzftumwrleacof`) mediante la consola oficial de administración.
4. **Respaldo de contingencia disponible:** Si surgiera cualquier anomalía con la RPC en la nube, el administrador puede aplicar `rollback_security_hardening.sql` (v4.1) con la certeza técnica de que la base de datos mantendrá su seguridad íntegra y que la plataforma Qurio operará en Modo de Contingencia sin interrupción de servicio para los alumnos.
