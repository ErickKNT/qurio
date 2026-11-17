-- ==============================================================================
-- Qurio: RBAC Criptográfico de Administración y Vistas/RPCs de Observabilidad
-- Archivo: database/supabase/04_admin_rbac.sql
-- Propósito:
--   1. Definir public.is_admin() leyendo exclusivamente app_metadata.role = 'admin'
--      (inmutable desde el cliente web; proviene de auth.users.raw_app_meta_data).
--   2. Añadir columna idempotente operational_status en public.exercises para
--      killswitches de catálogo ('active', 'hidden', 'under_review').
--   3. Exponer métricas curriculares agregadas y listado forense protegidos por
--      public.is_admin() = true o invocación autoritativa vía service_role.
--   4. Garantizar idempotencia absoluta (re-ejecutable sin errores).
-- ==============================================================================

-- 1. Función de comprobación RBAC criptográfico (app_metadata.role = 'admin')
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$SELECT coalesce( (nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' ->> 'role') = 'admin', false );$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- 2. Estado operativo de ejercicios para killswitches de catálogo
ALTER TABLE public.exercises
    ADD COLUMN IF NOT EXISTS operational_status VARCHAR(20) NOT NULL DEFAULT 'active';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'exercises_operational_status_check'
          AND conrelid = 'public.exercises'::regclass
    ) THEN
        ALTER TABLE public.exercises
            ADD CONSTRAINT exercises_operational_status_check
            CHECK (operational_status IN ('active', 'hidden', 'under_review'));
    END IF;
END $$;

-- 3. Políticas RLS de lectura administrativa sobre intentos y perfiles
--    (Complementa las políticas existentes de propietario sin abrir acceso a otros usuarios)
DROP POLICY IF EXISTS "Admin Read All Attempts" ON public.exercise_attempts;
CREATE POLICY "Admin Read All Attempts"
    ON public.exercise_attempts
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Read All Profiles" ON public.user_profiles;
CREATE POLICY "Admin Read All Profiles"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 4. Vista administrativa protegida de métricas por reto
--    (Exige public.is_admin() = true o ejecución vía service_role)
CREATE OR REPLACE VIEW public.admin_exercise_metrics_view AS
WITH ordered_attempts AS (
    SELECT
        ea.exercise_id,
        ea.user_id,
        ea.status,
        ea.hints_used,
        ea.execution_time_ms,
        ea.created_at,
        ROW_NUMBER() OVER (PARTITION BY ea.user_id, ea.exercise_id ORDER BY ea.created_at ASC) AS attempt_seq,
        BOOL_OR(ea.status = 'PASSED') OVER (PARTITION BY ea.user_id, ea.exercise_id) AS ever_passed
    FROM public.exercise_attempts ea
    WHERE public.is_admin()
       OR pg_catalog.current_setting('role', true) = 'service_role'
       OR coalesce(nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '') = 'service_role'
)
SELECT
    e.id AS exercise_id,
    e.title,
    e.sort_order,
    e.difficulty,
    e.operational_status,
    COUNT(oa.exercise_id)::INT AS total_attempts,
    COUNT(DISTINCT oa.user_id)::INT AS unique_users,
    COUNT(DISTINCT CASE WHEN oa.attempt_seq = 1 AND oa.status = 'PASSED' THEN oa.user_id END)::INT AS first_pass_users,
    COUNT(DISTINCT CASE WHEN NOT oa.ever_passed THEN oa.user_id END)::INT AS dropoff_users,
    COUNT(*) FILTER (WHERE oa.hints_used = 0)::INT AS hints_0_count,
    COUNT(*) FILTER (WHERE oa.hints_used = 1)::INT AS hints_1_count,
    COUNT(*) FILTER (WHERE oa.hints_used = 2)::INT AS hints_2_count,
    COUNT(*) FILTER (WHERE oa.hints_used >= 3)::INT AS hints_3_count,
    ROUND(COALESCE(AVG(oa.execution_time_ms), 0)::NUMERIC, 2) AS avg_execution_time_ms,
    ROUND(COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY oa.execution_time_ms), 0)::NUMERIC, 2) AS median_execution_time_ms
FROM public.exercises e
LEFT JOIN ordered_attempts oa ON oa.exercise_id = e.id
WHERE public.is_admin()
   OR pg_catalog.current_setting('role', true) = 'service_role'
   OR coalesce(nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '') = 'service_role'
GROUP BY e.id, e.title, e.sort_order, e.difficulty, e.operational_status
ORDER BY e.sort_order ASC;

REVOKE ALL ON public.admin_exercise_metrics_view FROM PUBLIC, anon;
GRANT SELECT ON public.admin_exercise_metrics_view TO authenticated, service_role;

-- 5. RPC autoritativa para métricas agregadas del currículum (con guardia explícita)
CREATE OR REPLACE FUNCTION public.admin_curriculum_metrics()
RETURNS TABLE (
    exercise_id UUID,
    title VARCHAR,
    sort_order INT,
    difficulty VARCHAR,
    operational_status VARCHAR,
    total_attempts INT,
    unique_users INT,
    first_pass_users INT,
    dropoff_users INT,
    hints_0_count INT,
    hints_1_count INT,
    hints_2_count INT,
    hints_3_count INT,
    avg_execution_time_ms NUMERIC,
    median_execution_time_ms NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT (
        public.is_admin()
        OR pg_catalog.current_setting('role', true) = 'service_role'
        OR coalesce(nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '') = 'service_role'
    ) THEN
        RAISE EXCEPTION 'ADMIN_PRIVILEGES_REQUIRED' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        v.exercise_id,
        v.title,
        v.sort_order,
        v.difficulty,
        v.operational_status,
        v.total_attempts,
        v.unique_users,
        v.first_pass_users,
        v.dropoff_users,
        v.hints_0_count,
        v.hints_1_count,
        v.hints_2_count,
        v.hints_3_count,
        v.avg_execution_time_ms,
        v.median_execution_time_ms
    FROM public.admin_exercise_metrics_view v;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_curriculum_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_curriculum_metrics() TO authenticated, service_role;
