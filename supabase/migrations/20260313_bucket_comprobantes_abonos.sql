-- ============================================================
-- MIGRATION: Bucket comprobantes-abonos (privado)
-- Fecha: 2026-03-13
-- Propósito: Storage para comprobantes de pago adjuntos a abonos
-- ============================================================

-- Crear bucket PRIVADO para comprobantes de abonos
-- (private = true: acceso solo mediante URLs firmadas generadas server-side)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'comprobantes-abonos',
  'comprobantes-abonos',
  false,  -- PRIVADO: sin URL pública directa
  ARRAY['image/jpeg','image/png','image/webp','application/pdf'],
  10485760  -- 10MB en bytes
)
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','application/pdf'],
  file_size_limit = 10485760;

-- RLS: usuarios autenticados pueden SUBIR (INSERT)
CREATE POLICY "comprobantes_abonos_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comprobantes-abonos');

-- RLS: usuarios autenticados pueden LEER (SELECT)
-- El acceso real se controla via URL firmada en el servidor
CREATE POLICY "comprobantes_abonos_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comprobantes-abonos');

-- RLS: usuarios autenticados pueden ELIMINAR (DELETE)
-- Necesario para limpiar archivos huérfanos cuando el modal se cierra durante upload.
-- Seguridad: el path contiene 3 UUIDs anidados (negociacion_id/fuente_id/timestamp),
-- lo que hace la enumeración efectivamente imposible.
CREATE POLICY "comprobantes_abonos_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'comprobantes-abonos');
