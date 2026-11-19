-- ==============================================================================
-- Qurio: Bucket y Políticas RLS de Supabase Storage para Avatares de Perfil
-- NOTA: Script idempotente para revisión y ejecución manual en el SQL Editor
-- de Supabase Cloud.
-- ==============================================================================

-- 1. Crear o actualizar el bucket 'avatars' con límites estrictos de tamaño y MIME
-- Se prohíbe explícitamente image/svg+xml para prevenir vectores Stored XSS.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    TRUE,
    2097152, -- 2 MiB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Políticas RLS sobre storage.objects para el bucket 'avatars'
-- Nota: storage.objects ya tiene RLS habilitado por defecto en Supabase.

DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
CREATE POLICY "Public Read Avatars"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users Upload Own Avatar" ON storage.objects;
CREATE POLICY "Users Upload Own Avatar"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
        AND name IN (
            auth.uid()::text || '/avatar.webp',
            auth.uid()::text || '/avatar.png'
        )
    );

DROP POLICY IF EXISTS "Users Update Own Avatar" ON storage.objects;
CREATE POLICY "Users Update Own Avatar"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
        AND name IN (
            auth.uid()::text || '/avatar.webp',
            auth.uid()::text || '/avatar.png'
        )
    );

DROP POLICY IF EXISTS "Users Delete Own Avatar" ON storage.objects;
CREATE POLICY "Users Delete Own Avatar"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
