-- ==============================================================================
-- Qurio: Script de Hardening de Seguridad y Autoridad Central de Progreso (Fase 9)
-- NOTA: Este archivo es para revisión y autorización previa del usuario.
-- NO se ejecuta automáticamente en producción sin aprobación explícita.
-- ==============================================================================

-- 1. Restricción de actualización de XP y Nivel en user_profiles para clientes directos
-- El usuario autenticado solo puede editar su perfil visual (display_name, avatar_url, bio, updated_at)
REVOKE UPDATE ON public.user_profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url, bio, updated_at) ON public.user_profiles TO authenticated;

-- 2. Revocar inserción directa de intentos desde el cliente frontend
-- Solo el backend verificado (vía RPC o service_role) puede certificar intentos resueltos
REVOKE INSERT ON public.exercise_attempts FROM authenticated;

-- 3. Función RPC protegida para registrar intentos verificados y otorgar XP con idempotencia
CREATE OR REPLACE FUNCTION public.record_verified_attempt(
    p_user_id UUID,
    p_exercise_id UUID,
    p_submitted_sql TEXT,
    p_status VARCHAR(20),
    p_execution_time_ms INT,
    p_error_message TEXT DEFAULT NULL,
    p_hints_used INT DEFAULT 0,
    p_xp_to_award INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_already_passed BOOLEAN := FALSE;
    v_effective_xp INT := 0;
    v_new_xp INT := 0;
    v_new_level INT := 1;
    v_module_id UUID;
BEGIN
    -- 1. Validar parámetros mínimos obligatorios
    IF p_user_id IS NULL OR p_exercise_id IS NULL THEN
        RAISE EXCEPTION 'user_id and exercise_id must not be null';
    END IF;

    -- 2. Verificar existencia del ejercicio y obtener su módulo
    SELECT e.module_id INTO v_module_id
    FROM public.exercises e
    WHERE e.id = p_exercise_id;

    IF v_module_id IS NULL THEN
        RAISE EXCEPTION 'Exercise % not found in database', p_exercise_id;
    END IF;

    -- 3. Idempotencia: Verificar si el usuario ya había aprobado previamente este ejercicio
    IF p_status = 'PASSED' THEN
        SELECT EXISTS (
            SELECT 1 FROM public.exercise_attempts a
            WHERE a.user_id = p_user_id
              AND a.exercise_id = p_exercise_id
              AND a.status = 'PASSED'
        ) INTO v_already_passed;

        -- Si es la primera vez que lo aprueba, se otorga el XP calculado por el backend
        IF NOT v_already_passed THEN
            v_effective_xp := GREATEST(0, p_xp_to_award);
        ELSE
            v_effective_xp := 0; -- Aprobado previamente: no duplica XP
        END IF;
    END IF;

    -- 4. Registrar el intento en el historial auditable
    INSERT INTO public.exercise_attempts (
        user_id,
        exercise_id,
        submitted_sql,
        status,
        execution_time_ms,
        error_message,
        hints_used,
        xp_awarded
    ) VALUES (
        p_user_id,
        p_exercise_id,
        p_submitted_sql,
        p_status,
        p_execution_time_ms,
        p_error_message,
        p_hints_used,
        v_effective_xp
    );

    -- 5. Si fue aprobado, actualizar XP, nivel y racha en user_profiles y user_progress
    IF p_status = 'PASSED' THEN
        UPDATE public.user_profiles
        SET xp = xp + v_effective_xp,
            level = 1 + FLOOR((xp + v_effective_xp) / 500)::INT,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_user_id
        RETURNING xp, level INTO v_new_xp, v_new_level;

        -- Actualizar progreso agregado del módulo
        INSERT INTO public.user_progress (user_id, module_id, exercises_completed_count, is_completed, updated_at)
        VALUES (p_user_id, v_module_id, 1, FALSE, timezone('utc'::text, now()))
        ON CONFLICT (user_id, module_id)
        DO UPDATE SET
            exercises_completed_count = (
                SELECT COUNT(DISTINCT a.exercise_id)
                FROM public.exercise_attempts a
                JOIN public.exercises ex ON a.exercise_id = ex.id
                WHERE a.user_id = p_user_id
                  AND ex.module_id = v_module_id
                  AND a.status = 'PASSED'
            ),
            updated_at = timezone('utc'::text, now());
    ELSE
        SELECT xp, level INTO v_new_xp, v_new_level
        FROM public.user_profiles
        WHERE id = p_user_id;
    END IF;

    -- Retornar resultado estructurado
    RETURN jsonb_build_object(
        'success', TRUE,
        'already_passed', v_already_passed,
        'xp_awarded', v_effective_xp,
        'total_xp', COALESCE(v_new_xp, 0),
        'level', COALESCE(v_new_level, 1)
    );
END;
$$;

-- 4. Restringir privilegios de ejecución de la función RPC
-- Solo el rol service_role (backend autenticado) puede invocar record_verified_attempt
REVOKE EXECUTE ON FUNCTION public.record_verified_attempt FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_verified_attempt FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_verified_attempt FROM authenticated;
GRANT EXECUTE ON FUNCTION public.record_verified_attempt TO service_role;
