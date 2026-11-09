-- ==============================================================================
-- Qurio: Script de Diagnóstico de Privilegios, Matriz ACL y Conciliación de XP
-- Versión: 2.0 (Auditoría Integral: aclexplode para PUBLIC, CLS en exercise_attempts
--          y Conciliación Multi-Fuente de XP sin Modificación Automática)
-- ==============================================================================

-- ==============================================================================
-- 1. Diagnóstico de Privilegios a Nivel de Tabla
-- ==============================================================================
SELECT
    r.rolname,
    t.table_name,
    has_table_privilege(r.rolname, 'public.' || t.table_name, 'SELECT') AS can_select,
    has_table_privilege(r.rolname, 'public.' || t.table_name, 'INSERT') AS can_insert,
    has_table_privilege(r.rolname, 'public.' || t.table_name, 'UPDATE') AS can_update,
    has_table_privilege(r.rolname, 'public.' || t.table_name, 'DELETE') AS can_delete
FROM (VALUES ('anon'), ('authenticated'), ('service_role')) AS r(rolname)
CROSS JOIN (
    VALUES ('user_profiles'), ('exercise_attempts'), ('user_progress'), ('exercises')
) AS t(table_name)
ORDER BY t.table_name, r.rolname;

-- ==============================================================================
-- 2. Diagnóstico de Privilegios a Nivel de Columna (CLS) en public.user_profiles
-- ==============================================================================
SELECT
    'user_profiles' AS table_name,
    c.column_name,
    has_column_privilege('anon', 'public.user_profiles', c.column_name, 'SELECT') AS anon_can_select,
    has_column_privilege('anon', 'public.user_profiles', c.column_name, 'UPDATE') AS anon_can_update,
    has_column_privilege('authenticated', 'public.user_profiles', c.column_name, 'SELECT') AS auth_can_select,
    has_column_privilege('authenticated', 'public.user_profiles', c.column_name, 'UPDATE') AS auth_can_update
FROM information_schema.columns c
WHERE c.table_schema = 'public' AND c.table_name = 'user_profiles'
ORDER BY c.ordinal_position;

-- ==============================================================================
-- 3. Diagnóstico de Privilegios a Nivel de Columna (CLS) en public.exercise_attempts
-- ==============================================================================
SELECT
    'exercise_attempts' AS table_name,
    c.column_name,
    has_column_privilege('anon', 'public.exercise_attempts', c.column_name, 'SELECT') AS anon_can_select,
    has_column_privilege('anon', 'public.exercise_attempts', c.column_name, 'INSERT') AS anon_can_insert,
    has_column_privilege('anon', 'public.exercise_attempts', c.column_name, 'UPDATE') AS anon_can_update,
    has_column_privilege('authenticated', 'public.exercise_attempts', c.column_name, 'SELECT') AS auth_can_select,
    has_column_privilege('authenticated', 'public.exercise_attempts', c.column_name, 'INSERT') AS auth_can_insert,
    has_column_privilege('authenticated', 'public.exercise_attempts', c.column_name, 'UPDATE') AS auth_can_update
FROM information_schema.columns c
WHERE c.table_schema = 'public' AND c.table_name = 'exercise_attempts'
ORDER BY c.ordinal_position;

-- ==============================================================================
-- 4. Diagnóstico de Privilegios en la RPC record_verified_attempt
-- ==============================================================================

-- 4.A Inspección Estricta de ACL mediante aclexplode (Auditoría para PUBLIC / grantee=0)
SELECT
    p.proname AS function_name,
    a.grantor::regrole::text AS grantor,
    CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END AS grantee,
    a.privilege_type,
    a.is_grantable
FROM pg_proc p
CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
WHERE p.proname = 'record_verified_attempt'
  AND p.pronamespace = 'public'::regnamespace;

-- 4.B Comprobación directa para roles estándar
SELECT
    r.rolname,
    has_function_privilege(
        r.rolname,
        'public.record_verified_attempt(UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT)',
        'EXECUTE'
    ) AS can_execute_rpc
FROM (VALUES ('anon'), ('authenticated'), ('service_role')) AS r(rolname);

-- ==============================================================================
-- 5. Diagnóstico de Políticas RLS Activas
-- ==============================================================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==============================================================================
-- 6. Diagnóstico de Duplicados Históricos en public.exercise_attempts
-- ==============================================================================
SELECT
    user_id,
    exercise_id,
    COUNT(*) AS total_passed_attempts,
    ARRAY_AGG(id ORDER BY created_at ASC) AS attempt_ids,
    ARRAY_AGG(xp_awarded ORDER BY created_at ASC) AS xp_values
FROM public.exercise_attempts
WHERE status = 'PASSED' AND xp_awarded > 0
GROUP BY user_id, exercise_id
HAVING COUNT(*) > 1;

-- ==============================================================================
-- 7. Auditoría Integral y Conciliación Multi-Fuente de XP (SIN MODIFICAR DATOS)
-- ==============================================================================
-- Evalúa todas las fuentes legítimas de XP:
--   a) Intentos de ejercicios aprobados (exercise_attempts)
--   b) Logros e insignias desbloqueadas (achievements)
--   c) Actividad y rachas diarias (user_daily_activity)
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
