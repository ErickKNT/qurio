-- ==============================================================================
-- Qurio: Procedimiento de Reversión Seguro (Rollback Seguro Fase 9)
-- Archivo: database/supabase/rollback_security_hardening.sql
-- ==============================================================================
-- DIRECTRICES ESTRICTAS DE SEGURIDAD (POSTGRESQL & SUPABASE HARDENING):
-- 1. NUNCA restaura permisos de UPDATE sobre xp o level a roles de cliente.
-- 2. NUNCA restaura permisos de INSERT sobre exercise_attempts a authenticated o anon.
-- 3. NUNCA recrea la política RLS 'User Insert Own Attempts' que permitiría a un
--    cliente falsificar intentos con status='PASSED'.
-- 4. En caso de contingencia técnica, la certificación de intentos queda en manos
--    exclusivas del backend mediante service_role o la plataforma opera en modo
--    de práctica local sin persistencia no certificada.
-- ==============================================================================

-- 1. Eliminar la función RPC record_verified_attempt
DROP FUNCTION IF EXISTS public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
);

-- 2. Eliminar el índice condicional anti-duplicados
DROP INDEX IF EXISTS public.idx_single_awarded_passed_attempt;

-- 3. Estado Blindado de public.user_profiles
-- Se mantienen revocados los permisos amplios sobre user_profiles.
-- Los roles de cliente (authenticated, anon, PUBLIC) NO reciben UPDATE sobre xp ni level.
REVOKE ALL ON TABLE public.user_profiles FROM PUBLIC, anon;
REVOKE UPDATE, INSERT, DELETE, TRUNCATE ON TABLE public.user_profiles FROM authenticated;
REVOKE UPDATE (id, username, level, xp, current_streak_days, max_streak_days, created_at)
    ON public.user_profiles FROM authenticated, anon, PUBLIC;
REVOKE INSERT (id, username, display_name, avatar_url, bio, level, xp, current_streak_days, max_streak_days, created_at, updated_at)
    ON public.user_profiles FROM authenticated, anon, PUBLIC;

-- Solo se permite lectura y actualización de campos visuales inocuos
GRANT SELECT ON TABLE public.user_profiles TO authenticated, anon;
GRANT UPDATE (display_name, avatar_url, bio, updated_at)
    ON public.user_profiles TO authenticated;

-- 4. Estado Blindado de public.exercise_attempts
-- Los clientes NO TIENEN PERMISOS DE INSERCIÓN DIRECTA NI MODIFICACIÓN.
-- Se preserva la revocación completa de INSERT y UPDATE para anon, authenticated y PUBLIC.
REVOKE ALL ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;
REVOKE INSERT (id, user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used, xp_awarded, created_at)
    ON public.exercise_attempts FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (id, user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used, xp_awarded, created_at)
    ON public.exercise_attempts FROM PUBLIC, anon, authenticated;
REVOKE DELETE, TRUNCATE ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;

-- Solo lectura auditada para authenticated (vía RLS: auth.uid() = user_id)
GRANT SELECT ON TABLE public.exercise_attempts TO authenticated;

-- El backend mantiene control para inserciones directas autorizadas
GRANT ALL ON TABLE public.exercise_attempts TO service_role;

-- Eliminar de forma definitiva cualquier política residual de inserción directa
DROP POLICY IF EXISTS "User Insert Own Attempts" ON public.exercise_attempts;

-- ==============================================================================
-- 5. PROCEDIMIENTO OPERACIONAL DE CONTINGENCIA
-- ==============================================================================
-- Si se revierte record_verified_attempt() por una incompatibilidad funcional:
-- a) El backend FastAPI puede seguir insertando intentos verificados directamente
--    mediante sentencias SQL parametrizadas utilizando la clave 'service_role'.
-- b) Alternativamente, si el backend está en mantenimiento, la plataforma pasa a
--    modo de práctica interactiva pura (evaluación semántica local en memoria sin
--    persistencia de progreso en la nube).
-- c) BAJO NINGUNA CIRCUNSTANCIA se deben otorgar privilegios de inserción a clientes
--    web frontend (evitando falsificación de intentos SEC-04 y auto-adjudicación SEC-02).
