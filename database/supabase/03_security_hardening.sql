-- ==============================================================================
-- Qurio: Script de Hardening de Seguridad y Autoridad Central de Progreso (Fase 9)
-- Versión: 3.0 (Hardening Estricto: search_path='', Validación Anti-NULL,
--          Regla Confiable de XP, Bloqueo FOR UPDATE y Consistencia de user_progress)
-- NOTA: Este archivo es para revisión y autorización previa del usuario.
-- NO se ejecuta automáticamente en producción sin aprobación explícita.
-- ==============================================================================

-- ==============================================================================
-- 1. DIAGNÓSTICO PREVIO: Verificación de Duplicados Históricos
-- ==============================================================================
-- Ejecutar esta consulta antes de aplicar la migración en Supabase Cloud.
-- Si devuelve filas con duplicados > 1, no crear el índice hasta resolverlos
-- según el procedimiento de consolidación documentado en el informe técnico.
/*
SELECT user_id, exercise_id, COUNT(*) AS duplicados,
       ARRAY_AGG(id ORDER BY created_at ASC) AS attempt_ids,
       ARRAY_AGG(xp_awarded ORDER BY created_at ASC) AS xp_historico
FROM public.exercise_attempts
WHERE status = 'PASSED' AND xp_awarded > 0
GROUP BY user_id, exercise_id
HAVING COUNT(*) > 1;
*/

-- ==============================================================================
-- 2. RESTRICCIÓN DE PRIVILEGIOS DE TABLA Y COLUMNA (CLS)
-- ==============================================================================

-- A. Blindaje sobre public.user_profiles
-- Revocar todos los privilegios a nivel de tabla para evitar permisos heredados o residuales
REVOKE ALL ON TABLE public.user_profiles FROM PUBLIC, anon;
REVOKE UPDATE, INSERT, DELETE, TRUNCATE ON TABLE public.user_profiles FROM authenticated;

-- Revocar explícitamente cualquier permiso a nivel de columna previamente concedido
REVOKE UPDATE (id, username, level, xp, current_streak_days, max_streak_days, created_at)
    ON public.user_profiles FROM authenticated, anon, PUBLIC;

-- Otorgar estrictamente solo lectura general y actualización de campos visuales de perfil
GRANT SELECT ON TABLE public.user_profiles TO authenticated, anon;
GRANT UPDATE (display_name, avatar_url, bio, updated_at)
    ON public.user_profiles TO authenticated;

-- B. Blindaje sobre public.exercise_attempts
-- Eliminar la capacidad de inserción directa desde clientes frontend (SEC-04)
REVOKE ALL ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.exercise_attempts TO authenticated; -- Lectura personal auditada por RLS
GRANT ALL ON TABLE public.exercise_attempts TO service_role;

-- Eliminar explícitamente la política RLS residual de inserción directa (Defensa en Profundidad)
DROP POLICY IF EXISTS "User Insert Own Attempts" ON public.exercise_attempts;

-- ==============================================================================
-- 3. RESTRICCIÓN DE UNICIDAD CONDICIONAL (ANTI-DUPLICADOS DE XP)
-- ==============================================================================
-- Garantiza en el motor físico de PostgreSQL que no puedan existir dos registros con
-- status='PASSED' y xp_awarded > 0 para el mismo (user_id, exercise_id).
-- Los intentos posteriores de práctica se permiten registrando xp_awarded = 0.
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_awarded_passed_attempt
    ON public.exercise_attempts (user_id, exercise_id)
    WHERE status = 'PASSED' AND xp_awarded > 0;

-- ==============================================================================
-- 4. FUNCIÓN RPC: record_verified_attempt (Autoridad Central de Certificación)
-- ==============================================================================
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
SET search_path = ''
AS $$
DECLARE
    v_current_xp INT := 0;
    v_current_level INT := 1;
    v_module_id UUID;
    v_base_xp INT := 0;
    v_penalty_rate NUMERIC;
    v_max_allowable_xp INT := 0;
    v_already_passed BOOLEAN := FALSE;
    v_effective_xp INT := 0;
    v_new_xp INT := 0;
    v_new_level INT := 1;
    v_total_module_exercises INT := 0;
    v_completed_count INT := 0;
    v_is_module_completed BOOLEAN := FALSE;
BEGIN
    -- -------------------------------------------------------------------------
    -- A. Validación Rigurosa Anti-NULL y Límites de Parámetros
    -- Cada condición evalúa explícitamente IS NULL para evitar que valores nulos
    -- eludan la validación booleana en PostgreSQL (ej. 'NOT IN' con NULL evalúa a NULL).
    -- -------------------------------------------------------------------------
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

    -- -------------------------------------------------------------------------
    -- B. Bloqueo Transaccional Concurrente y Existencia del Usuario
    -- Serializa cualquier solicitud concurrente del mismo usuario mediante FOR UPDATE.
    -- -------------------------------------------------------------------------
    SELECT xp, level INTO v_current_xp, v_current_level
    FROM public.user_profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile with id % does not exist', p_user_id;
    END IF;

    -- -------------------------------------------------------------------------
    -- C. Regla Confiable de XP: Consulta de Ejercicio y Módulo desde la Base de Datos
    -- No se confía ciegamente en p_xp_to_award; se valida contra la recompensa base
    -- oficial y la penalización por pistas del ejercicio.
    -- -------------------------------------------------------------------------
    SELECT e.module_id, e.xp_reward INTO v_module_id, v_base_xp
    FROM public.exercises e
    WHERE e.id = p_exercise_id;

    IF NOT FOUND OR v_module_id IS NULL THEN
        RAISE EXCEPTION 'Exercise % not found in public.exercises', p_exercise_id;
    END IF;

    -- Calcular el XP máximo admisible según las reglas del ejercicio (15% penalización por pista, mín 10 XP)
    v_penalty_rate := LEAST(0.45, p_hints_used * 0.15);
    v_max_allowable_xp := GREATEST(10, pg_catalog.floor(v_base_xp * (1.0 - v_penalty_rate))::INT);

    IF p_xp_to_award > v_max_allowable_xp THEN
        RAISE EXCEPTION 'xp_to_award (%) exceeds maximum allowable XP (%) for exercise %',
            p_xp_to_award, v_max_allowable_xp, p_exercise_id;
    END IF;

    -- -------------------------------------------------------------------------
    -- D. Verificación de Idempotencia Formativa
    -- Regla Qurio: Solo la primera aprobación del ejercicio acredita XP.
    -- Sesiones posteriores de práctica son registradas pero con 0 XP.
    -- -------------------------------------------------------------------------
    IF p_status = 'PASSED' THEN
        SELECT EXISTS (
            SELECT 1 FROM public.exercise_attempts a
            WHERE a.user_id = p_user_id
              AND a.exercise_id = p_exercise_id
              AND a.status = 'PASSED'
        ) INTO v_already_passed;

        IF NOT v_already_passed THEN
            v_effective_xp := p_xp_to_award;
        ELSE
            v_effective_xp := 0; -- Reto ya superado previamente: 0 XP adicional
        END IF;
    ELSE
        v_effective_xp := 0;
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
            level = 1 + pg_catalog.floor((xp + v_effective_xp) / 500)::INT,
            updated_at = pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
        WHERE id = p_user_id
        RETURNING xp, level INTO v_new_xp, v_new_level;

        -- 2. Calcular total de ejercicios del módulo actual
        SELECT pg_catalog.count(*) INTO v_total_module_exercises
        FROM public.exercises
        WHERE module_id = v_module_id;

        -- 3. Calcular ejercicios distintos aprobados por este usuario en el módulo
        SELECT pg_catalog.count(DISTINCT a.exercise_id) INTO v_completed_count
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
            pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
        )
        ON CONFLICT (user_id, module_id)
        DO UPDATE SET
            exercises_completed_count = EXCLUDED.exercises_completed_count,
            is_completed = EXCLUDED.is_completed,
            updated_at = pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());
    ELSE
        -- ---------------------------------------------------------------------
        -- F.2 Intentos FAILED o ERROR: Preservar y reportar el estado REAL del progreso
        -- No alterar XP y recuperar el progreso actual exacto del módulo
        -- ---------------------------------------------------------------------
        v_new_xp := v_current_xp;
        v_new_level := v_current_level;

        SELECT p.exercises_completed_count, p.is_completed
        INTO v_completed_count, v_is_module_completed
        FROM public.user_progress p
        WHERE p.user_id = p_user_id AND p.module_id = v_module_id;

        IF NOT FOUND THEN
            v_completed_count := 0;
            v_is_module_completed := FALSE;
        END IF;
    END IF;

    -- -------------------------------------------------------------------------
    -- G. Retorno Estructurado
    -- -------------------------------------------------------------------------
    RETURN pg_catalog.jsonb_build_object(
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

-- ==============================================================================
-- 5. ASIGNACIÓN DE PROPIETARIO Y PERMISOS ESTRICTOS DE EJECUCIÓN (FIRMA COMPLETA)
-- ==============================================================================
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
