-- ==============================================================================
-- Qurio: Procedimiento de Reversión y Desactivación Segura de RPC (Fase 11.3)
-- Archivo: database/supabase/rollback_security_hardening.sql
-- Versión: 4.1 (Desactivación Segura de RPC record_verified_attempt,
--          Conservación Estricta de Hardening CLS/RLS y Blindaje Total de Secuencias)
-- ==============================================================================
-- DIRECTRICES DE CONTINUIDAD OPERATIVA Y SEGURIDAD:
-- 1. Este procedimiento es una DESACTIVACIÓN SEGURA DE LA RPC, NO una reversión
--    de las medidas de seguridad CLS y RLS.
-- 2. En caso de contingencia técnica con record_verified_attempt(), la función
--    se elimina para evitar cálculos erróneos o corrupción de datos.
-- 3. NUNCA restaura permisos de UPDATE sobre xp o level a roles de cliente.
-- 4. NUNCA restaura permisos de INSERT sobre exercise_attempts a authenticated o anon.
-- 5. NUNCA recrea la política RLS 'User Insert Own Attempts' que permitiría a un
--    cliente falsificar intentos con status='PASSED'.
-- 6. CONSERVA el índice único parcial idx_single_awarded_passed_attempt para
--    garantizar integridad física anti-duplicados de XP positivo en PostgreSQL.
-- 7. CONSERVA el blindaje CLS sobre public.exercises: solution_query permanece
--    estrictamente inaccesible para anon y authenticated.
-- 8. Purgar y revocar cualquier concesión residual sobre columnas para anon y PUBLIC.
-- 9. Blindar completamente las secuencias de public: cero privilegios para clientes.
-- 10. Cuando la RPC no está disponible, el backend FastAPI conmuta a Modo de
--     Contingencia: la práctica en Sandbox funciona 100%, pero otorga estrictamente
--     0 XP oficial sin fabricar progreso no certificado en la nube.
-- ==============================================================================

-- ==============================================================================
-- 1. ELIMINACIÓN DE LA FUNCIÓN RPC record_verified_attempt
-- ==============================================================================
DROP FUNCTION IF EXISTS public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
);

-- ==============================================================================
-- 2. PRESERVACIÓN DEL ÍNDICE ÚNICO PARCIAL DE INTEGRIDAD
-- ==============================================================================
-- Se garantiza la existencia del índice condicional independiente.
-- Impide que coexistan dos intentos con status='PASSED' y xp_awarded > 0
-- para el mismo usuario y ejercicio, mientras admite reintentos con xp_awarded = 0.
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_awarded_passed_attempt
    ON public.exercise_attempts (user_id, exercise_id)
    WHERE status = 'PASSED' AND xp_awarded > 0;

-- ==============================================================================
-- 3. CONFIRMACIÓN DE ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ==============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_activity ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 4. POLÍTICAS RLS DEFENSIVAS
-- ==============================================================================
DROP POLICY IF EXISTS "User Insert Own Attempts" ON public.exercise_attempts;

-- ==============================================================================
-- 5. BLINDAJE ESTRICTO DE public.user_profiles Y PURGA DE RESIDUOS
-- ==============================================================================
-- Revocación de permisos de tabla
REVOKE ALL ON TABLE public.user_profiles FROM PUBLIC, anon;
REVOKE UPDATE, INSERT, DELETE, TRUNCATE ON TABLE public.user_profiles FROM authenticated;

-- Purga de permisos residuales de columna para anon y PUBLIC (UPDATE e INSERT)
REVOKE UPDATE, INSERT (
    id, username, display_name, avatar_url, bio, level, xp,
    current_streak_days, max_streak_days, created_at, updated_at
) ON TABLE public.user_profiles FROM PUBLIC, anon;

-- Revocación estricta de columnas críticas para authenticated
REVOKE UPDATE (
    id, username, level, xp, current_streak_days, max_streak_days, created_at
) ON TABLE public.user_profiles FROM authenticated;

REVOKE INSERT (
    id, username, display_name, avatar_url, bio, level, xp,
    current_streak_days, max_streak_days, created_at, updated_at
) ON TABLE public.user_profiles FROM authenticated;

-- Concesiones controladas mínimas
GRANT SELECT ON TABLE public.user_profiles TO authenticated, anon;
GRANT UPDATE (display_name, avatar_url, bio, updated_at)
    ON TABLE public.user_profiles TO authenticated;
GRANT ALL ON TABLE public.user_profiles TO service_role;

-- ==============================================================================
-- 6. BLINDAJE ESTRICTO DE public.exercise_attempts
-- ==============================================================================
REVOKE ALL ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;

-- Purga de permisos por columna
REVOKE INSERT, UPDATE (
    id, user_id, exercise_id, submitted_sql, status, execution_time_ms,
    error_message, hints_used, xp_awarded, created_at
) ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;

REVOKE SELECT (
    id, user_id, exercise_id, submitted_sql, status, execution_time_ms,
    error_message, hints_used, xp_awarded, created_at
) ON TABLE public.exercise_attempts FROM PUBLIC, anon;

GRANT SELECT ON TABLE public.exercise_attempts TO authenticated;
GRANT ALL ON TABLE public.exercise_attempts TO service_role;

-- ==============================================================================
-- 7. BLINDAJE DE SOLUCIONES EN public.exercises (CLS PRESERVADO)
-- ==============================================================================
REVOKE ALL ON TABLE public.exercises FROM PUBLIC, anon, authenticated;
REVOKE SELECT ON TABLE public.exercises FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.exercises FROM PUBLIC, anon, authenticated;

-- Purga de permisos de columna
REVOKE INSERT, UPDATE (
    id, module_id, title, prompt, initial_code, solution_query, target_database,
    xp_reward, difficulty, check_order, sort_order, created_at
) ON TABLE public.exercises FROM PUBLIC, anon, authenticated;

GRANT SELECT (
    id, module_id, title, prompt, initial_code, target_database,
    xp_reward, difficulty, check_order, sort_order, created_at
) ON TABLE public.exercises TO anon, authenticated;

GRANT ALL ON TABLE public.exercises TO service_role;

-- ==============================================================================
-- 8. BLINDAJE DE PROGRESO Y ACTIVIDAD (public.user_progress, etc.)
-- ==============================================================================
REVOKE ALL ON TABLE public.user_progress FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.user_progress FROM authenticated;
REVOKE INSERT, UPDATE (
    id, user_id, module_id, exercises_completed_count, is_completed, updated_at
) ON TABLE public.user_progress FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.user_progress TO authenticated;
GRANT ALL ON TABLE public.user_progress TO service_role;

REVOKE ALL ON TABLE public.user_achievements FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.user_achievements FROM authenticated;
GRANT SELECT ON TABLE public.user_achievements TO authenticated;
GRANT ALL ON TABLE public.user_achievements TO service_role;

REVOKE ALL ON TABLE public.user_daily_activity FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.user_daily_activity FROM authenticated;
GRANT SELECT ON TABLE public.user_daily_activity TO authenticated;
GRANT ALL ON TABLE public.user_daily_activity TO service_role;

-- ==============================================================================
-- 9. BLINDAJE DE CATÁLOGOS EDUCATIVOS
-- ==============================================================================
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.learning_paths FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.learning_paths TO anon, authenticated;
GRANT ALL ON TABLE public.learning_paths TO service_role;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.modules FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.modules TO anon, authenticated;
GRANT ALL ON TABLE public.modules TO service_role;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.lessons FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.lessons TO anon, authenticated;
GRANT ALL ON TABLE public.lessons TO service_role;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.exercise_hints FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.exercise_hints TO anon, authenticated;
GRANT ALL ON TABLE public.exercise_hints TO service_role;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.achievements FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.achievements TO anon, authenticated;
GRANT ALL ON TABLE public.achievements TO service_role;

-- ==============================================================================
-- 10. BLINDAJE TOTAL DE SECUENCIAS (CERO PRIVILEGIOS A ROLES DE CLIENTE)
-- ==============================================================================
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ==============================================================================
-- 11. CONTINUIDAD OPERATIVA EN MODO CONTINGENCIA
-- ==============================================================================
-- Tras ejecutar este script:
-- a) La RPC record_verified_attempt() deja de existir físicamente en Supabase.
-- b) El evaluador en FastAPI continúa validando semánticamente las consultas en
--    PostgreSQL Sandbox (el estudiante no se queda bloqueado).
-- c) Al fallar la llamada a la RPC (ej. PGRST202), el backend FastAPI activa el Modo
--    de Contingencia: retorna estrictamente 'xp_awarded = 0' y notifica al usuario que
--    la práctica es exitosa pero la certificación de XP está temporalmente en pausa.
-- d) El índice idx_single_awarded_passed_attempt continúa activo previniendo duplicados.
-- e) Al restaurarse el hardening v6.1 con la RPC, el usuario podrá resolver retos
--    y acreditar su XP legítimo sin que los intentos de contingencia (con 0 XP)
--    lo bloqueen de por vida.
