-- ============================================
-- CREAR BUCKET DE STORAGE PARA DOCUMENTOS
-- ============================================

-- Crear bucket privado
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos-proyectos',
  'documentos-proyectos',
  false, -- Privado
  52428800, -- 50MB en bytes
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- DOCX
    'application/msword', -- DOC
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', -- XLSX
    'application/vnd.ms-excel', -- XLS
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/csv',
    'application/vnd.ms-powerpoint', -- PPT
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- PPTX
    'image/svg+xml',
    'application/x-autocad', -- DWG
    'application/acad' -- DWG
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLÍTICAS DE SEGURIDAD PARA EL BUCKET
-- ============================================

-- PRIMERO: Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can upload files in their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Permitir a usuarios autenticados SUBIR archivos en su carpeta
CREATE POLICY "Users can upload files in their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos-proyectos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a usuarios autenticados VER sus archivos
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos-proyectos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a usuarios autenticados ACTUALIZAR sus archivos
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos-proyectos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'documentos-proyectos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a usuarios autenticados ELIMINAR sus archivos
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos-proyectos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver bucket creado
SELECT * FROM storage.buckets WHERE id = 'documentos-proyectos';

-- Ver políticas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%documentos%';
