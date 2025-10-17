-- =====================================================
-- CONFIGURACIÓN DE STORAGE PARA DOCUMENTOS DE CLIENTES
-- =====================================================

-- Crear bucket para documentos de clientes
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-clientes', 'documentos-clientes', true);

-- Políticas de Storage para documentos-clientes
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

-- =====================================================
-- ALTERNATIVA: Crear bucket desde Dashboard
-- =====================================================
-- 1. Ve a Storage en el dashboard de Supabase
-- 2. Click en "New bucket"
-- 3. Nombre: documentos-clientes
-- 4. Public: ✓ (marcado)
-- 5. Click "Create bucket"
-- 6. Las políticas se aplicarán automáticamente con este script
-- =====================================================
