# Qurio — Auditoría del Procedimiento de Rollback y Continuidad Operativa (Fase 11.3)

**Identificador:** `QURIO-PHASE-11.3-ROLLBACK-AUDIT`  
**Fecha de auditoría:** 10 de Noviembre de 2026  
**Rama autorizada:** `feat/phase-11-pilot-readiness`  
**Archivo fuente auditado:** [`database/supabase/rollback_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/rollback_security_hardening.sql)  
**Versión canónica:** **4.0 (Desactivación Segura de RPC y Conservación Estricta de Hardening CLS/RLS)**  
**Área:** Seguridad en Bases de Datos, Continuidad de Negocio, Procedimientos de Contingencia y Backend FastAPI  
**Veredicto de Auditoría:** **APROBADO CON RESTRICCIONES** (Requiere aplicación administrativa manual en Supabase Cloud si ocurre contingencia)

---

## 1. Resumen Ejecutivo y Alcance

Esta auditoría técnica examina exhaustivamente el procedimiento de contingencia y reversión formalizado en `rollback_security_hardening.sql`, contrastándolo de forma directa con:
1. El script de endurecimiento canónico [`database/supabase/03_security_hardening.sql`](file:///c:/Desarrollo/Qurio/database/supabase/03_security_hardening.sql) v6.1.
2. La arquitectura real del backend FastAPI ([`apps/api/app/core/supabase.py`](file:///c:/Desarrollo/Qurio/apps/api/app/core/supabase.py) y [`apps/api/app/modules/runner/router.py`](file:///c:/Desarrollo/Qurio/apps/api/app/modules/runner/router.py)).
3. Los esquemas relacionales físicos y pruebas de integración de base de datos en [`apps/api/tests/test_supabase_migration.py`](file:///c:/Desarrollo/Qurio/apps/api/tests/test_supabase_migration.py).

El propósito primordial es garantizar que, ante una contingencia que obligue a desactivar la RPC `record_verified_attempt`, la base de datos y la aplicación operen de forma armónica:
* **Sin degradar el blindaje de seguridad:** `solution_query` jamás debe quedar expuesta y los clientes jamás deben poder inyectar intentos o inflar XP.
* **Sin mentir al usuario ni corromper datos:** Si la RPC no existe, la práctica interactiva continúa, pero se desactiva taxativamente la adjudicación de XP oficial no certificado.
* **Sin bloqueo irreversible:** Un intento resuelto durante la contingencia (con 0 XP) no debe impedir que el usuario reclame su recompensa oficial legítima cuando la RPC se restablezca.

---

## 2. Auditoría Detallada de los 8 Criterios del Rollback

### 2.1 Firma Exacta de la Función Eliminada
* **Hallazgo Previo:** En borradores antiguos se referenciaban firmas incompletas de 7 parámetros con tipos `NUMERIC`.
* **Verificación Física en v4.0:**
  ```sql
  DROP FUNCTION IF EXISTS public.record_verified_attempt(
      UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
  );
  ```
  La firma coincide con absoluta precisión con los 8 parámetros implementados en `03_security_hardening.sql` v6.1:
  `p_user_id UUID, p_exercise_id UUID, p_submitted_sql TEXT, p_status VARCHAR(20), p_execution_time_ms INT, p_error_message TEXT, p_hints_used INT, p_xp_to_award INT`.
* **Resultado:** **CONFORME (100% Exactitud)**.

### 2.2 Conservación del Índice Único Parcial (`idx_single_awarded_passed_attempt`)
* **Verificación:** El script de reversión **NO elimina el índice condicional**. Adicionalmente, incluye la cláusula idempotente:
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS idx_single_awarded_passed_attempt
      ON public.exercise_attempts (user_id, exercise_id)
      WHERE status = 'PASSED' AND xp_awarded > 0;
  ```
* **Impacto Operativo:** El motor físico de PostgreSQL continúa bloqueando cualquier duplicación de XP positivo, incluso si un actor intentara inserciones directas mediante `service_role`. Al mismo tiempo, permite múltiples reintentos de práctica formativa con `xp_awarded = 0`.
* **Resultado:** **CONFORME**.

### 2.3 Revocación Completa de Permisos de Escritura para Clientes
* **Verificación:** En todas las tablas del esquema público (`user_profiles`, `exercise_attempts`, `user_progress`, `user_achievements`, `user_daily_activity`, `exercises`, etc.), se ejecutan sentencias deterministas:
  ```sql
  REVOKE ALL ON TABLE public.<tabla> FROM PUBLIC, anon;
  REVOKE UPDATE, INSERT, DELETE, TRUNCATE ON TABLE public.<tabla> FROM authenticated;
  ```
* **Resultado:** Ningún usuario anónimo ni estudiante autenticado posee privilegios de escritura directos a nivel de tabla.

### 2.4 Ausencia de Permisos Residuales de Actualización por Columna en `user_profiles`
* **Hallazgo Crítico y Subsanación:** En PostgreSQL, cuando se otorga un privilegio a nivel de columna (por ejemplo, `GRANT UPDATE (display_name)`), un posterior `REVOKE ALL ON TABLE` a nivel de tabla **no revoca automáticamente los permisos de columna residuales**. Si un script previo hubiese otorgado privilegios a `anon` o `PUBLIC`, estos permanecerían activos.
* **Corrección Aplicada en v4.0:**
  ```sql
  -- Purga exhaustiva de permisos residuales de columna para anon y PUBLIC
  REVOKE SELECT, INSERT, UPDATE, REFERENCES (
      id, username, display_name, avatar_url, bio, level, xp,
      current_streak_days, max_streak_days, created_at, updated_at
  ) ON public.user_profiles FROM PUBLIC, anon;

  -- Revocación de columnas críticas para authenticated
  REVOKE SELECT, INSERT, UPDATE, REFERENCES (
      id, username, level, xp, current_streak_days, max_streak_days, created_at
  ) ON public.user_profiles FROM authenticated;
  ```
* **Permisos Concedidos Controlados:** Únicamente `authenticated` recibe `UPDATE (display_name, avatar_url, bio, updated_at)` para permitir la edición de su perfil estético en la UI, filtrado por la política RLS `auth.uid() = id`.
* **Resultado:** **CONFORME Y PURGADO AL 100%**.

### 2.5 Protección Permanente de `solution_query` (CLS Preservado)
* **Verificación:** El script de rollback **no restaura privilegios sobre `solution_query`**.
  ```sql
  REVOKE ALL ON TABLE public.exercises FROM PUBLIC, anon, authenticated;
  REVOKE SELECT ON TABLE public.exercises FROM PUBLIC, anon, authenticated;
  GRANT SELECT (
      id, module_id, title, prompt, initial_code, target_database,
      xp_reward, difficulty, check_order, sort_order, created_at
  ) ON TABLE public.exercises TO anon, authenticated;
  GRANT ALL ON TABLE public.exercises TO service_role;
  ```
* **Resultado:** `solution_query` permanece estrictamente inaccesible para clientes a través de la API PostgREST (`401 permission denied`).

### 2.6 Conservación de Políticas RLS en las 11 Tablas
* **Verificación:** Se ejecuta `ALTER TABLE public.<tabla> ENABLE ROW LEVEL SECURITY;` sobre las 11 tablas del sistema. La política vulnerable `"User Insert Own Attempts"` es eliminada permanentemente (`DROP POLICY IF EXISTS`).
* **Resultado:** **CONFORME**.

### 2.7 Comportamiento de Secuencias y Privilegios Asociados
* **Verificación:** Aunque el esquema utiliza identificadores UUID generados por software (`gen_random_uuid()`), el script blinda defensivamente cualquier secuencia que pudiera crearse:
  ```sql
  REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
  ```
* **Resultado:** Ningún cliente posee permisos de modificación (`UPDATE`/`ALTER`) sobre secuencias del esquema `public`.

### 2.8 Compatibilidad con Hardening v6.1 y Reversibilidad
* **Verificación:** Tras ejecutar `rollback_security_hardening.sql`, si el administrador decide restablecer la RPC, puede volver a aplicar `03_security_hardening.sql` v6.1 de forma inmediata y sin conflictos de llaves foráneas ni colisión de nombres.
* **Resultado:** **100% Idempotente y Reversible**.

---

## 3. Delimitación Conceptual del Procedimiento

> [!IMPORTANT]
> **El script `rollback_security_hardening.sql` NO es una reversión total de la seguridad:**
> Es una **desactivación segura de la función RPC `record_verified_attempt`**.
>
> Un "rollback" ingenuo que devolviera los permisos originales de Supabase (donde `authenticated` tenía `INSERT` en `exercise_attempts` y `UPDATE` en `user_profiles`) abriría de inmediato las vulnerabilidades críticas SEC-02 (falsificación de XP) y SEC-04 (inserción de intentos inventados con `status='PASSED'`).
>
> Por diseño de ingeniería, este procedimiento desactiva la lógica de certificación transaccional sin desmontar las murallas de defensa RLS y CLS.

---

## 4. Análisis de Continuidad Operativa en Backend FastAPI

Se evaluaron las dos estrategias planteadas para el backend ante la ausencia de la RPC:

### Alternativa A: Persistencia Transaccional Directa desde FastAPI
* **Descripción:** Implementar en Python una secuencia de consultas SQL directas contra Supabase utilizando `asyncpg` o llamadas REST con `service_role` (`INSERT INTO exercise_attempts`, `UPDATE user_profiles`, `INSERT/UPDATE user_progress`).
* **Análisis de Riesgo:**
  * Duplica en código Python la compleja lógica de bloqueo `FOR UPDATE`, cálculo de sub-objetivos de módulo y validación de penalizaciones de pistas.
  * Mayor propensión a condiciones de carrera en alta concurrencia si la red tiene latencia entre los tres `INSERT/UPDATE` sucesivos.
  * Introduce código no probado en producción que contraviene la directriz de estabilización previa al piloto.
* **Dictamen:** **DESCARTADA POR RIESGO OPERATIVO INNECESARIO**.

### Alternativa B (Estrategia Aprobada): Modo de Contingencia sin Adjudicación Falsa
* **Descripción:** Si la llamada a la RPC falla (HTTP 404 porque la función fue eliminada, o error de red), el backend:
  1. Permite que la evaluación semántica en PostgreSQL Sandbox continúe normalmente: el estudiante ve sus datos, columnas y sabe si su consulta es correcta.
  2. Detecta el fallo de la RPC mediante `if rpc_res.get("success") is True: ... else: ...`.
  3. Establece taxativamente `evaluation.xp_awarded = 0`.
  4. Entrega un mensaje pedagógico transparente:
     > *"¡Reto resuelto correctamente! Modo de contingencia: tu consulta es válida, pero la certificación oficial de XP no está disponible temporalmente."*
* **Ventajas Críticas:**
  * **Cero Falsedad:** El frontend jamás muestra `+35 XP acreditados` si la base de datos no persistió el récord.
  * **Cero Bloqueo de Alumnos:** El estudiante puede continuar aprendiendo y resolviendo consultas en el Sandbox de Docker.
  * **No Pérdida de Progreso:** Como el intento se registró con 0 XP (o no se registró en Cloud), cuando la RPC se restablezca, el usuario podrá reenviar su consulta y la RPC v6.1 le otorgará su XP legítimo completo gracias a la disociación `NOT v_already_awarded`.
* **Dictamen:** **APROBADA E IMPLEMENTADA**.

---

## 5. Conciliación de Versiones Documentales

| Documento | Versión Previa Citada | Versión Canónica Conciliada | Estado |
|:---|:---:|:---:|:---:|
| `database/supabase/rollback_security_hardening.sql` | v3.0 (en encabezado) | **v4.0** | **Sincronizado** |
| `docs/audits/QURIO_PHASE_11_SECURITY_REVIEW.md` | v4.0 | **v4.0** | **Sincronizado** |
| `docs/audits/QURIO_PHASE_11_PILOT_READINESS.md` | v4.0 | **v4.0** | **Sincronizado** |
| `docs/BITACORA.md` | v4.0 | **v4.0** | **Sincronizado** |

El archivo físico SQL en el repositorio es la **fuente única de verdad**. Todos los documentos citan de forma homogénea la **Versión 4.0**.

---

## 6. Dictamen Final

### Dictamen: APROBADO CON RESTRICCIONES

El procedimiento de reversión y desactivación segura formalizado en `rollback_security_hardening.sql` v4.0 cumple al 100% con los estándares de seguridad de datos, higiene de privilegios, blindaje contra exfiltración de soluciones e integridad de progreso.

**Restricción Operativa Administrativa:**
El script no se ejecuta de forma automática. Permanece en el repositorio para uso exclusivo del propietario en caso de una incidencia crítica no prevista durante el piloto.
