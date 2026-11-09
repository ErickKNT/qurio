-- ==============================================================================
-- Qurio: Script de Hardening de Seguridad y Autoridad Central de Progreso (Fase 9)
-- Versión: 2.0 (Revisión Final de Producción con Bloqueo Transaccional y CLS)
-- NOTA: Este archivo es para revisión y autorización previa del usuario.
-- NO se ejecuta automáticamente en producción sin aprobación explícita.
-- ==============================================================================

-- 1. Restricción de actualización de XP y Nivel en user_profiles para clientes directos
-- El usuario autenticado solo puede editar su perfil visual (display_name, avatar_url, bio, updated_at)
REVOKE UPDATE ON public.user_profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url, bio, updated_at) ON public.user_profiles TO authenticated;

-- 2. Revocar inserción directa de intentos desde el cliente frontend
-- Solo el backend verificado (vía RPC bajo rol service_role) puede certificar intentos
REVOKE INSERT ON public.exercise_attempts FROM authenticated;
REVOKE INSERT ON public.exercise_attempts FROM anon;

-- 3. Restricción de unicidad condicional para impedir físicamente múltiples premios de XP
-- Asegura a nivel de motor PostgreSQL que no puedan existir dos intentos con status='PASSED'
-- y xp_awarded > 0 para el mismo (user_id, exercise_id), incluso ante fallas de aplicación.
-- Los intentos posteriores de práctica se permiten registrando xp_awarded = 0.
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_awarded_passed_attempt
    ON public.exercise_attempts (user_id, exercise_id)
    WHERE status = 'PASSED' AND xp_awarded > 0;

-- 4. Función RPC protegida para registrar intentos verificados y otorgar XP con idempotencia
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
    v_current_xp INT := 0;
    v_current_level INT := 1;
    v_already_passed BOOLEAN := FALSE;
    v_effective_xp INT := 0;
    v_new_xp INT := 0;
    v_new_level INT := 1;
    v_module_id UUID;
    v_total_module_exercises INT := 0;
    v_completed_count INT := 0;
    v_is_module_completed BOOLEAN := FALSE;
BEGIN
    -- -------------------------------------------------------------------------
    -- A. Validación Rigurosa de Parámetros de Entrada
    -- -------------------------------------------------------------------------
    IF p_user_id IS NULL OR p_exercise_id IS NULL THEN
        RAISE EXCEPTION 'user_id and exercise_id must not be null';
    END IF;

    IF p_status NOT IN ('PASSED', 'FAILED', 'ERROR') THEN
        RAISE EXCEPTION 'Invalid status: %. Must be PASSED, FAILED or ERROR', p_status;
    END IF;

    IF p_execution_time_ms < 0 THEN
        RAISE EXCEPTION 'execution_time_ms cannot be negative, got %', p_execution_time_ms;
    END IF;

    IF p_hints_used < 0 OR p_hints_used > 3 THEN
        RAISE EXCEPTION 'hints_used must be between 0 and 3, got %', p_hints_used;
    END IF;

    IF p_xp_to_award < 0 OR p_xp_to_award > 500 THEN
        RAISE EXCEPTION 'xp_to_award out of bounds (0-500), got %', p_xp_to_award;
    END IF;

    IF p_submitted_sql IS NULL OR length(trim(p_submitted_sql)) = 0 THEN
        RAISE EXCEPTION 'submitted_sql cannot be empty';
    END IF;

    IF length(p_submitted_sql) > 10000 THEN
        RAISE EXCEPTION 'submitted_sql exceeds maximum allowed size of 10000 characters';
    END IF;

    -- -------------------------------------------------------------------------
    -- B. Bloqueo Transaccional Concurrente y Existencia de Usuario
    -- Serializa solicitudes concurrentes del mismo usuario mediante FOR UPDATE.
    -- -------------------------------------------------------------------------
    SELECT xp, level INTO v_current_xp, v_current_level
    FROM public.user_profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile with id % does not exist', p_user_id;
    END IF;

    -- -------------------------------------------------------------------------
    -- C. Verificación de Existencia de Ejercicio y Módulo
    -- -------------------------------------------------------------------------
    SELECT e.module_id INTO v_module_id
    FROM public.exercises e
    WHERE e.id = p_exercise_id;

    IF NOT FOUND OR v_module_id IS NULL THEN
        RAISE EXCEPTION 'Exercise % not found in public.exercises', p_exercise_id;
    END IF;

    -- -------------------------------------------------------------------------
    -- D. Verificación de Idempotencia
    -- -------------------------------------------------------------------------
    IF p_status = 'PASSED' THEN
        SELECT EXISTS (
            SELECT 1 FROM public.exercise_attempts a
            WHERE a.user_id = p_user_id
              AND a.exercise_id = p_exercise_id
              AND a.status = 'PASSED'
        ) INTO v_already_passed;

        -- Solo se otorga XP si es la primera vez que supera este reto
        IF NOT v_already_passed THEN
            v_effective_xp := GREATEST(0, p_xp_to_award);
        ELSE
            v_effective_xp := 0; -- Aprobado previamente: intento de práctica sin duplicar XP
        END IF;
    END IF;

    -- -------------------------------------------------------------------------
    -- E. Registro del Intento en el Historial Auditable
    -- -------------------------------------------------------------------------
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

    -- -------------------------------------------------------------------------
    -- F. Actualización Atómica de Perfil y Progreso de Módulos
    -- -------------------------------------------------------------------------
    IF p_status = 'PASSED' THEN
        -- 1. Actualizar XP y Nivel en user_profiles
        UPDATE public.user_profiles
        SET xp = xp + v_effective_xp,
            level = 1 + FLOOR((xp + v_effective_xp) / 500)::INT,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_user_id
        RETURNING xp, level INTO v_new_xp, v_new_level;

        -- 2. Calcular total de ejercicios del módulo actual
        SELECT COUNT(*) INTO v_total_module_exercises
        FROM public.exercises
        WHERE module_id = v_module_id;

        -- 3. Calcular ejercicios distintos aprobados por este usuario en el módulo
        SELECT COUNT(DISTINCT a.exercise_id) INTO v_completed_count
        FROM public.exercise_attempts a
        JOIN public.exercises ex ON a.exercise_id = ex.id
        WHERE a.user_id = p_user_id
          AND ex.module_id = v_module_id
          AND a.status = 'PASSED';

        v_is_module_completed := (v_completed_count >= v_total_module_exercises AND v_total_module_exercises > 0);

        -- 4. Actualizar progreso del módulo con valores auditados reales
        INSERT INTO public.user_progress (
            user_id,
            module_id,
            exercises_completed_count,
            is_completed,
            updated_at
        ) VALUES (
            p_user_id,
            v_module_id,
            v_completed_count,
            v_is_module_completed,
            timezone('utc'::text, now())
        )
        ON CONFLICT (user_id, module_id)
        DO UPDATE SET
            exercises_completed_count = EXCLUDED.exercises_completed_count,
            is_completed = EXCLUDED.is_completed,
            updated_at = timezone('utc'::text, now());
    ELSE
        -- Si no aprobó, devolver el estado actual sin modificar
        v_new_xp := v_current_xp;
        v_new_level := v_current_level;
    END IF;

    -- -------------------------------------------------------------------------
    -- G. Retorno Estructurado
    -- -------------------------------------------------------------------------
    RETURN jsonb_build_object(
        'success', TRUE,
        'already_passed', v_already_passed,
        'xp_awarded', v_effective_xp,
        'total_xp', COALESCE(v_new_xp, 0),
        'level', COALESCE(v_new_level, 1),
        'module_completed', v_is_module_completed,
        'exercises_completed_count', v_completed_count
    );
END;
$$;

-- 5. Propietario y Restricción Estricta de Privilegios de Ejecución (Firma Completa)
ALTER FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.record_verified_attempt(
    UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT
) TO service_role;
