# Informe de Resultados de Remediación y Hardening de Seguridad (Fase 9) — Qurio

**Fecha:** 9 de Noviembre de 2026  
**Versión:** 5.0 (Cierre Definitivo de Hardening: Revocación Explícita de SELECT por Columna, Preservación de Índice en Rollback y Conciliación Multi-Fuente)  
**Rama Git:** `security/phase-9-hardening`  
**Estado:** Implementación Local y Validación Automatizada Concluidas al 100% (**NO se ejecutará en Supabase Cloud sin autorización explícita del usuario**)  
**Autores:** Equipo de PostgreSQL Database Security, AppSec, Supabase Platform Security y QA de Qurio  

---

## 1. Resumen Ejecutivo

En cumplimiento de los requerimientos de cierre para la **Fase 9: Hardening de Seguridad**, se han implementado los dos ajustes finales requeridos sobre la migración y el procedimiento de reversión, alcanzando una arquitectura blindada de **defensa en profundidad estricta**:

1. **Revocación Explícita de `SELECT` por Columna en `exercise_attempts`:** Se garantizó que los roles `PUBLIC` y `anon` no dispongan de privilegios residuales de lectura en ninguna de las 10 columnas de la tabla.
2. **Preservación del Índice Único Parcial durante el Rollback:** El índice estructural `idx_single_awarded_passed_attempt` se conserva incluso si la función RPC es retirada, protegiendo físicamente la base de datos contra duplicaciones de XP positivo tanto en régimen normal como en contingencia.

### Indicadores Clave de Calidad y Seguridad
* **Batería Completa de Pruebas Automatizadas:** **64 de 64 pruebas pasando exitosamente en 3.79s** (`64/64 PASSED`):
  * `test_security.py`: 23/23 pruebas (AST con SQLGlot, prevención de SQLi, contención de recursión con límites reales de PostgreSQL, validación de las 18 consultas oficiales del currículo).
  * `test_evaluator.py`: 14/14 pruebas (Evaluador de dos capas: exactitud `Decimal` sin colapso IEEE 754, inspector didáctico de AST para `ROUND()`, y cálculo proporcional de XP en 0, 5, 10, 20 y 100 XP).
  * `test_supabase_migration.py`: 9/9 pruebas (Matriz CLS completa de tabla y columna, rechazo anti-NULL, cálculo autoritativo de XP, concurrencia en conexiones físicas independientes sin condiciones de carrera, consistencia de progreso y prueba de reversión con supervivencia de índice).
  * `test_auth.py`: 6/6 pruebas (Autenticación asimétrica ES256 vía JWKS, expiración, audience y modo invitado aislado).
  * `test_integration.py`: 11/11 pruebas (Flujo integral de endpoints, contratos de API y manejo de errores).
  * `test_rate_limit.py`: 1/1 prueba (Rate limiting en memoria por IP/Usuario y semáforo de concurrencia).
* **Compilación Frontend:** TypeScript estricto con `vite build` completado en 5.84s con 0 errores.
* **Integridad de Producción:** La rama `main` y el proyecto Supabase Cloud permanecen 100% inalterados.

---

## 2. Ajustes Finales Implementados (Versión 5.0)

### 2.1 Revocación Explícita de `SELECT` por Columna en `exercise_attempts`
Para asegurar que ningún privilegio previo a nivel de columna permita a roles no autenticados acceder a los intentos de los estudiantes:
* **Verificación de Esquema:** Se comprobó que las diez columnas coincidan exactamente con el esquema oficial ([`01_schema.sql`](file:///c:/Desarrollo/Qurio/database/supabase/01_schema.sql#L106-L125)):
  `id`, `user_id`, `exercise_id`, `submitted_sql`, `status`, `execution_time_ms`, `error_message`, `hints_used`, `xp_awarded`, `created_at`.
* **Fragmento SQL Definitivo ([`03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql#L97-L113)):**
  ```sql
  -- Revocación explícita de SELECT por columna para PUBLIC y anon
  REVOKE SELECT (
      id,
      user_id,
      exercise_id,
      submitted_sql,
      status,
      execution_time_ms,
      error_message,
      hints_used,
      xp_awarded,
      created_at
  )
  ON public.exercise_attempts
  FROM PUBLIC, anon;

  -- Concesión restringida: Solo lectura personal auditada por RLS para el estudiante
  GRANT SELECT ON TABLE public.exercise_attempts TO authenticated;
  ```
* **Diagnóstico de Privilegios ([`diagnose_privileges.sql`](file:///c:/Desarrollo/Qurio/database/supabase/diagnose_privileges.sql#L37-L65)):**
  Se implementó una consulta que distingue con exactitud matemática entre:
  * Privilegios efectivos (`has_column_privilege`): `anon_effective_select = FALSE` en las 10 columnas; `auth_effective_select = TRUE` (filtrado por RLS).
  * Privilegios directos por columna en la ACL (`pg_attribute.attacl` con `aclexplode`): `public_explicit_column_select = FALSE` y `anon_explicit_column_select = FALSE` en todas las columnas.

---

### 2.2 Conservación del Índice Único Parcial en el Procedimiento de Rollback
* **Principio de Integridad:** El índice condicional `idx_single_awarded_passed_attempt` constituye una salvaguarda de almacenamiento físico independiente de la RPC.
* **Fragmento SQL Definitivo ([`rollback_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/rollback_security_hardening.sql#L20-L28)):**
  ```sql
  -- 1. Eliminar la función RPC record_verified_attempt
  DROP FUNCTION IF EXISTS public.record_verified_attempt(
      UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
  );

  -- 2. PRESERVACIÓN DEL ÍNDICE ÚNICO PARCIAL DE INTEGRIDAD
  -- El índice idx_single_awarded_passed_attempt NO se elimina durante el rollback.
  -- Permanece como una salvaguarda estructural independiente en el motor físico de PostgreSQL,
  -- garantizando que nunca puedan coexistir dos intentos con status='PASSED' y xp_awarded > 0
  -- para el mismo usuario y ejercicio, mientras continúa permitiendo reintentos con xp_awarded = 0.
  -- (Se eliminó la instrucción DROP INDEX).
  ```
* **Comportamiento Demostrado en Pruebas (`test_rollback_script_preserves_strict_security`):**
  1. El índice sobrevive intacto tras ejecutar el script de rollback (`idx_exists = TRUE`).
  2. Tras el rollback, un segundo intento con `status='PASSED'` y `xp_awarded > 0` es **bloqueado físicamente** por el motor de PostgreSQL arrojando `UniqueViolationError`.
  3. Múltiples reintentos de práctica con `status='PASSED'` y `xp_awarded = 0` se registran exitosamente sin colisión.
  4. Los clientes `authenticated` continúan teniendo **prohibido insertar registros** (`InsufficientPrivilegeError`) o modificar `xp` y `level` en `user_profiles` (`InsufficientPrivilegeError`).

---

### 2.3 Confirmación de Datos Históricos y Conciliación Multi-Fuente de XP
* **Confirmación Estricta:** **CERO FILAS O REGISTROS HISTÓRICOS MODIFICADOS**.
* En Qurio, el XP total acumulado en `public.user_profiles.xp` se compone de:
  1. Ejercicios aprobados (`exercise_attempts.xp_awarded`).
  2. Logros e insignias desbloqueadas (`user_achievements` $\to$ `achievements.xp_reward`).
  3. Actividad y rachas diarias (`user_daily_activity.xp_earned`).
* Se incorporó tanto en `03_security_hardening.sql` como en `diagnose_privileges.sql` la consulta de auditoría no destructiva que calcula `discrepancy = current_xp - (attempts + achievements + daily_activity)` de solo lectura, impidiendo que procesos de ajuste borren balances legítimos.

---

## 3. Matriz de Privilegios Efectivos Auditada

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
| Columna | auth_effective_select | auth_effective_insert | auth_effective_update | anon_effective_select | public_explicit_select |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `id` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | **FALSE** |
| `user_id` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | **FALSE** |
| `exercise_id` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | **FALSE** |
| `submitted_sql` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | **FALSE** |
| `status` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | **FALSE** |
| `execution_time_ms` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | **FALSE** |
| `error_message` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | **FALSE** |
| `hints_used` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | **FALSE** |
| `xp_awarded` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | **FALSE** |
| `created_at` | **TRUE** | **FALSE** | **FALSE** | **FALSE** | **FALSE** |

---

## 4. Evidencia Automatizada de Pruebas

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

============================= 64 passed in 3.79s ==============================
```

Compilación de Producción Frontend:
```text
✓ 2168 modules transformed.
dist/index.html                   2.76 kB │ gzip:   1.13 kB
dist/assets/index-znX9RXHt.css   43.67 kB │ gzip:   7.88 kB
dist/assets/index-CLyu80KF.js   631.60 kB │ gzip: 172.93 kB
✓ built in 5.84s
```

---

## 5. Estado de Git y Entregables Definitivos

* **Rama Activa de Trabajo:** `security/phase-9-hardening` (sincronizada en remoto `origin/security/phase-9-hardening`).
* **Rama Principal (`main`):** Limpia, inalterada y protegida.
* **Supabase Cloud:** Intacto. Cero modificaciones remotas.
* **Entregables Finales:**
  1. [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) (v5.0)
  2. [`database/supabase/rollback_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/rollback_security_hardening.sql) (v3.0)
  3. [`database/supabase/diagnose_privileges.sql`](file:///c:/Desarrollo/Qurio/database/supabase/diagnose_privileges.sql) (v3.0)
  4. [`apps/api/tests/test_supabase_migration.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_supabase_migration.py) (v5.0)
  5. [`docs/BITACORA.md`](file:///c:/Desarrollo/Qurio/docs/BITACORA.md) (Entrada 27 de cierre de fase)
  6. [`docs/security/SECURITY_REMEDIATION_RESULTS.md`](file:///c:/Desarrollo/Qurio/docs/security/SECURITY_REMEDIATION_RESULTS.md) (v5.0)
