-- ==============================================================================
-- Qurio: Constancias Verificables y Certificados SQL (PostgreSQL / Supabase)
-- Script idempotente para ejecutar en el SQL Editor de Supabase Cloud.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL,
    track_title TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    verification_code TEXT UNIQUE NOT NULL,
    completed_exercises INT NOT NULL CHECK (completed_exercises >= 0),
    total_exercises INT NOT NULL CHECK (total_exercises > 0),
    is_qa_preview BOOLEAN NOT NULL DEFAULT FALSE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_user_certificates_code
    ON public.user_certificates (verification_code);

CREATE INDEX IF NOT EXISTS idx_user_certificates_user
    ON public.user_certificates (user_id, issued_at DESC);

ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

-- Los estudiantes autenticados pueden leer únicamente sus propias constancias;
-- la emisión y la verificación pública por código pasan por el backend FastAPI (service_role).
DROP POLICY IF EXISTS "Users can view own certificates" ON public.user_certificates;
CREATE POLICY "Users can view own certificates"
    ON public.user_certificates
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
