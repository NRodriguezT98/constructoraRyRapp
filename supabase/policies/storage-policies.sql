-- Políticas RLS para Storage Bucket: documentos-proyectos
-- Ejecutar en Supabase SQL Editor

-- 1. Permitir uploads para usuarios autenticados
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos-proyectos');

-- 2. Permitir lectura para usuarios autenticados
CREATE POLICY IF NOT EXISTS "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documentos-proyectos');

-- 3. Permitir eliminación para usuarios autenticados
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documentos-proyectos');
