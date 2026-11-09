-- ==============================================================================
-- Qurio: Script de Diagnóstico de Privilegios y Matriz de Acceso
-- Utiliza funciones del sistema PostgreSQL (has_table_privilege, has_column_privilege,
-- has_function_privilege) e information_schema para auditar el estado exacto de permisos.
-- ==============================================================================

-- 1. Diagnóstico de Privilegios a Nivel de Tabla
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

-- 2. Diagnóstico de Privilegios a Nivel de Columna (CLS) en user_profiles para 'authenticated'
SELECT
    c.column_name,
    has_column_privilege('authenticated', 'public.user_profiles', c.column_name, 'SELECT') AS can_select,
    has_column_privilege('authenticated', 'public.user_profiles', c.column_name, 'UPDATE') AS can_update
FROM information_schema.columns c
WHERE c.table_schema = 'public' AND c.table_name = 'user_profiles'
ORDER BY c.ordinal_position;

-- 3. Diagnóstico de Privilegios de Ejecución en la Función RPC record_verified_attempt
SELECT
    r.rolname,
    has_function_privilege(
        r.rolname,
        'public.record_verified_attempt(UUID, UUID, TEXT, VARCHAR, INT, TEXT, INT, INT)',
        'EXECUTE'
    ) AS can_execute_rpc
FROM (VALUES ('public'), ('anon'), ('authenticated'), ('service_role')) AS r(rolname);

-- 4. Diagnóstico de Políticas RLS Activas
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

-- 5. Diagnóstico de Duplicados Históricos en exercise_attempts
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
