-- ============================================
-- FIX: Políticas RLS para Storage - documentos-clientes
-- ============================================
-- Permite que usuarios autenticados suban archivos a cualquier
-- subcarpeta dentro de su carpeta (userId/...)
-- ============================================

-- 1. Eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Usuarios pueden subir a su carpeta" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden ver sus archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir documentos 1ipxcp3_0" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden leer documentos 1ipxcp3_0" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar documentos 1ipxcp3_0" ON storage.objects;

-- 2. Política de INSERT (subir archivos)
-- Permite subir a: userId/*, userId/clienteId/*, userId/clienteId/cedula/*, etc.
CREATE POLICY "Usuarios pueden subir a su carpeta"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos-clientes' AND
  name LIKE (auth.uid()::text || '/%')
);

-- 3. Política de SELECT (ver archivos)
CREATE POLICY "Usuarios pueden ver sus archivos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos-clientes' AND
  name LIKE (auth.uid()::text || '/%')
);

-- 4. Política de UPDATE (actualizar archivos)
CREATE POLICY "Usuarios pueden actualizar sus archivos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos-clientes' AND
  name LIKE (auth.uid()::text || '/%')
)
WITH CHECK (
  bucket_id = 'documentos-clientes' AND
  name LIKE (auth.uid()::text || '/%')
);

-- 5. Política de DELETE (eliminar archivos)
CREATE POLICY "Usuarios pueden eliminar sus archivos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos-clientes' AND
  name LIKE (auth.uid()::text || '/%')
);

-- 6. Verificar que el bucket sea público (para obtener URLs públicas)
UPDATE storage.buckets
SET public = true
WHERE id = 'documentos-clientes';

-- 7. Verificar políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%Usuarios%'
ORDER BY policyname;
