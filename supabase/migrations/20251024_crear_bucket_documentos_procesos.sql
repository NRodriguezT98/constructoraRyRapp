-- =====================================================
-- CREAR BUCKET: documentos-procesos
-- Descripción: Almacena documentos requeridos en pasos de procesos de negociación
-- Fecha: 2025-10-24
-- =====================================================

-- 1. Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-procesos', 'documentos-procesos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas RLS para el bucket

-- Política: Los usuarios pueden VER sus propios documentos
CREATE POLICY "Los usuarios pueden ver sus propios documentos de procesos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos-procesos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Los usuarios pueden SUBIR a su propia carpeta
CREATE POLICY "Los usuarios pueden subir documentos a su carpeta"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos-procesos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Los usuarios pueden ACTUALIZAR sus propios documentos
CREATE POLICY "Los usuarios pueden actualizar sus documentos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos-procesos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Los usuarios pueden ELIMINAR sus propios documentos
CREATE POLICY "Los usuarios pueden eliminar sus documentos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos-procesos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- COMENTARIO
-- =====================================================

COMMENT ON CONSTRAINT buckets_pkey ON storage.buckets IS
'Bucket para documentos de procesos de negociación. Estructura: userId/procesos/negociacionId/pasoId/documento.ext';
