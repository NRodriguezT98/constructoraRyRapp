-- =====================================================
-- MIGRACIÓN: Agregar políticas RLS para bucket renuncias-comprobantes
-- =====================================================
-- El bucket 'renuncias-comprobantes' es privado pero no tenía
-- políticas RLS, lo que bloqueaba las subidas desde el frontend.
-- =====================================================

-- 1. Política INSERT: autenticados pueden subir archivos
CREATE POLICY "Usuarios autenticados pueden subir a renuncias-comprobantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'renuncias-comprobantes'
);

-- 2. Política SELECT: autenticados pueden leer/descargar archivos
CREATE POLICY "Usuarios autenticados pueden ver renuncias-comprobantes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'renuncias-comprobantes'
);

-- 3. Política UPDATE: autenticados pueden actualizar (para upsert)
CREATE POLICY "Usuarios autenticados pueden actualizar renuncias-comprobantes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'renuncias-comprobantes'
);

-- 4. Política DELETE: solo administradores pueden eliminar
CREATE POLICY "Solo admins pueden eliminar de renuncias-comprobantes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'renuncias-comprobantes'
  AND EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
  )
);

-- Verificación
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%renuncias%'
ORDER BY policyname;
