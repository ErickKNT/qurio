-- ==============================================================================
-- Qurio: Procedimiento de Reversión Seguro (Rollback Seguro Fase 9)
-- Archivo: database/supabase/rollback_security_hardening.sql
-- ==============================================================================
-- DIRECTRIZ DE SEGURIDAD OBLIGATORIA:
-- Este script revierte las modificaciones de la Fase 9 SIN restaurar permisos
-- amplios ni inseguros (NUNCA restaura GRANT UPDATE general sobre user_profiles
-- ni permite manipulación arbitraria de xp o level).
-- ==============================================================================

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
-- Si se requiere restaurar la inserción directa previa por falla crítica del backend:
-- Se restaura la política RLS y el permiso de inserción restringido a columnas operativas,
-- pero EXCLUYENDO explícitamente xp_awarded para mitigar fraude directo.
GRANT SELECT ON TABLE public.exercise_attempts TO authenticated;
GRANT INSERT (user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used)
    ON public.exercise_attempts TO authenticated;

CREATE POLICY "User Insert Own Attempts" ON public.exercise_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Confirmación del Estado Post-Rollback
-- user_profiles.xp y user_profiles.level quedan congelados contra ataques directos.
-- Las credenciales de service_role mantienen control administrativo completo.
