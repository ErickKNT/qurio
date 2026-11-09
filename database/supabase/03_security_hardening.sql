-- ==============================================================================
-- Qurio: Script de Hardening de Seguridad y Autoridad Central de Progreso (Fase 9)
-- Versión: 4.0 (Cálculo Autoritativo de XP sin Mínimo Artificial, Blindaje CLS
--          Integral en exercise_attempts, search_path='' y Diagnóstico Multi-Fuente de XP)
-- NOTA: Este archivo es para revisión y autorización previa del usuario.
-- NO se ejecuta automáticamente en producción sin aprobación explícita.
-- ==============================================================================

-- ==============================================================================
-- 1. DIAGNÓSTICO PREVIO: Auditoría de Fuentes de XP y Duplicados Históricos
-- ==============================================================================
-- DIRECTRIZ OBLIGATORIA: NO MODIFICAR DATOS HISTÓRICOS AUTOMÁTICAMENTE.
-- En Qurio, el XP total acumulado en user_profiles.xp proviene de múltiples fuentes:
--   1) Ejercicios resueltos (public.exercise_attempts.xp_awarded).
--   2) Logros e insignias desbloqueadas (public.user_achievements -> achievements.xp_reward).
--   3) Actividad diaria y bonos de racha (public.user_daily_activity.xp_earned).
-- NUNCA se debe recalcular user_profiles.xp sumando exclusivamente exercise_attempts,
-- ya que eliminaría el XP legítimo ganado por logros y rachas.
--
-- Consulta 1.A: Verificación de Duplicados en Intentos Aprobados
/*
SELECT user_id, exercise_id, COUNT(*) AS duplicados,
       ARRAY_AGG(id ORDER BY created_at ASC) AS attempt_ids,
       ARRAY_AGG(xp_awarded ORDER BY created_at ASC) AS xp_historico
FROM public.exercise_attempts
WHERE status = 'PASSED' AND xp_awarded > 0
GROUP BY user_id, exercise_id
HAVING COUNT(*) > 1;
*/
--
-- Consulta 1.B: Conciliación Multi-Fuente de XP por Usuario (Auditoría previa a cualquier ajuste)
/*
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
*/

-- ==============================================================================
-- 2. RESTRICCIÓN DE PRIVILEGIOS DE TABLA Y COLUMNA (CLS)
-- ==============================================================================

-- A. Blindaje sobre public.user_profiles
-- Revocar todos los privilegios a nivel de tabla
REVOKE ALL ON TABLE public.user_profiles FROM PUBLIC, anon;
REVOKE UPDATE, INSERT, DELETE, TRUNCATE ON TABLE public.user_profiles FROM authenticated;

-- Revocar explícitamente cualquier permiso a nivel de columna (UPDATE e INSERT)
REVOKE UPDATE (id, username, level, xp, current_streak_days, max_streak_days, created_at)
    ON public.user_profiles FROM authenticated, anon, PUBLIC;
REVOKE INSERT (id, username, display_name, avatar_url, bio, level, xp, current_streak_days, max_streak_days, created_at, updated_at)
    ON public.user_profiles FROM authenticated, anon, PUBLIC;

-- Otorgar estrictamente solo lectura general y actualización de campos visuales de perfil
GRANT SELECT ON TABLE public.user_profiles TO authenticated, anon;
GRANT UPDATE (display_name, avatar_url, bio, updated_at)
    ON public.user_profiles TO authenticated;

-- B. Blindaje exhaustivo sobre public.exercise_attempts (SEC-04)
-- 1. Revocación a nivel de tabla
REVOKE ALL ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;
REVOKE DELETE, TRUNCATE ON TABLE public.exercise_attempts FROM PUBLIC, anon, authenticated;

-- 2. Revocación explícita a nivel de columna (INSERT y UPDATE en TODAS las columnas)
-- Garantiza que ningún privilegio de columna previo permita eludir el control de tabla
REVOKE INSERT (id, user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used, xp_awarded, created_at)
    ON public.exercise_attempts FROM PUBLIC, anon, authenticated;

REVOKE UPDATE (id, user_id, exercise_id, submitted_sql, status, execution_time_ms, error_message, hints_used, xp_awarded, created_at)
    ON public.exercise_attempts FROM PUBLIC, anon, authenticated;

-- 3. Concesión restringida: Solo lectura personal auditada por RLS para el estudiante
GRANT SELECT ON TABLE public.exercise_attempts TO authenticated;

-- 4. Acceso total reservado exclusivamente para backend (service_role)
GRANT ALL ON TABLE public.exercise_attempts TO service_role;

-- 5. Eliminar explícitamente la política RLS residual de inserción directa (Defensa en Profundidad)
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
    v_authoritative_xp INT := 0;
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
    -- C. Cálculo Autoritativo de XP sin Mínimo Artificial
    -- El valor de XP se deriva directamente del registro oficial en exercises.
    -- Se valida que e.xp_reward sea no nulo y no negativo.
    -- La penalización oficial es de 15% por pista (0 a 3 pistas = 0% a 45% de deducción).
    -- El XP calculado nunca supera la recompensa base ni desciende de 0.
    -- Se elimina cualquier cota mínima artificial (como un umbral rígido de 10 XP).
    -- -------------------------------------------------------------------------
    SELECT e.module_id, e.xp_reward INTO v_module_id, v_base_xp
    FROM public.exercises e
    WHERE e.id = p_exercise_id;

    IF NOT FOUND OR v_module_id IS NULL THEN
        RAISE EXCEPTION 'Exercise % not found in public.exercises', p_exercise_id;
    END IF;

    IF v_base_xp IS NULL OR v_base_xp < 0 THEN
        RAISE EXCEPTION 'Invalid xp_reward (%) for exercise % in public.exercises', v_base_xp, p_exercise_id;
    END IF;

    -- Cálculo de XP con penalización porcentual sobre base real
    v_penalty_rate := LEAST(0.45, GREATEST(0.0, p_hints_used * 0.15));
    v_authoritative_xp := LEAST(v_base_xp, GREATEST(0, pg_catalog.floor(v_base_xp * (1.0 - v_penalty_rate))::INT));

    -- Validación defensiva del parámetro p_xp_to_award:
    -- Preservado en la RPC para validar la consistencia del backend contra la BD.
    -- Si el llamador intenta otorgar más XP que el valor autoritativo, se aborta la transacción.
    IF p_xp_to_award > v_authoritative_xp THEN
        RAISE EXCEPTION 'p_xp_to_award (%) exceeds authoritative calculated XP (%) for exercise % with % hints',
            p_xp_to_award, v_authoritative_xp, p_exercise_id, p_hints_used;
    END IF;

    -- -------------------------------------------------------------------------
    -- D. Verificación de Idempotencia Formativa
    -- Regla Qurio: Solo la primera aprobación del ejercicio acredita XP.
    -- Sesiones posteriores de práctica son registradas pero con 0 XP.
    -- Si p_xp_to_award es 0 (modo práctica o test sin recompensa), se respeta 0.
    -- -------------------------------------------------------------------------
    IF p_status = 'PASSED' THEN
        SELECT EXISTS (
            SELECT 1 FROM public.exercise_attempts a
            WHERE a.user_id = p_user_id
              AND a.exercise_id = p_exercise_id
              AND a.status = 'PASSED'
        ) INTO v_already_passed;

        IF NOT v_already_passed THEN
            IF p_xp_to_award = 0 AND v_authoritative_xp > 0 THEN
                v_effective_xp := 0; -- Acreditación voluntaria o prueba con 0 XP
            ELSE
                v_effective_xp := v_authoritative_xp;
            END IF;
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
