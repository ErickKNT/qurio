-- ==============================================================================
-- Qurio: Script de Inicialización de Seguridad para el Sandbox de Prácticas
-- Base de datos: ecommerce_sandbox
-- ==============================================================================

-- 1. Crear el rol de ejecución para los estudiantes
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'readonly_student') THEN
      CREATE ROLE readonly_student WITH LOGIN PASSWORD 'student_safe_pass';
   END IF;
END
$do$;

-- 2. Restricciones estrictas de ejecución y memoria sobre el rol
ALTER ROLE readonly_student SET statement_timeout = '2000ms';
ALTER ROLE readonly_student SET idle_in_transaction_session_timeout = '3000ms';
ALTER ROLE readonly_student SET lock_timeout = '1000ms';
ALTER ROLE readonly_student SET work_mem = '16MB';
ALTER ROLE readonly_student SET temp_file_limit = '32MB';
ALTER ROLE readonly_student SET default_transaction_read_only = on;

-- 3. Permisos de conexión y esquema
GRANT CONNECT ON DATABASE ecommerce_sandbox TO readonly_student;
GRANT USAGE ON SCHEMA public TO readonly_student;

-- 4. Permisos de solo lectura sobre tablas existentes y futuras
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_student;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_student;

-- 5. Revocar permisos de creación o alteración
REVOKE CREATE ON SCHEMA public FROM readonly_student;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO PUBLIC;

