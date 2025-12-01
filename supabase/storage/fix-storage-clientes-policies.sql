-- =====================================================
-- FIX: POLÍTICAS RLS PARA STORAGE DOCUMENTOS-CLIENTES
-- =====================================================

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver documentos de clientes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir documentos de clientes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar documentos de clientes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar documentos de clientes" ON storage.objects;

-- Crear políticas correctas
CREATE POLICY "Usuarios autenticados pueden ver documentos de clientes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documentos-clientes');

CREATE POLICY "Usuarios autenticados pueden subir documentos de clientes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documentos-clientes');

CREATE POLICY "Usuarios autenticados pueden actualizar documentos de clientes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documentos-clientes')
  WITH CHECK (bucket_id = 'documentos-clientes');

CREATE POLICY "Usuarios autenticados pueden eliminar documentos de clientes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documentos-clientes');

-- Verificar políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%clientes%'
ORDER BY policyname;
