-- ============================================
-- SUPABASE STORAGE: Configuración de Buckets
-- ============================================

-- Crear bucket para documentos de proyectos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documentos-proyectos',
    'documentos-proyectos',
    false, -- Privado, solo accesible con autenticación
    52428800, -- 50MB límite por archivo
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- .docx
        'application/msword', -- .doc
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', -- .xlsx
        'application/vnd.ms-excel', -- .xls
        'application/vnd.ms-powerpoint', -- .ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- .pptx
        'application/zip',
        'application/x-rar-compressed',
        'text/plain',
        'application/dwg', -- AutoCAD
        'image/vnd.dwg'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLÍTICAS DE STORAGE
-- ============================================

-- Política: Los usuarios pueden ver sus propios documentos
CREATE POLICY "Los usuarios pueden ver documentos de sus proyectos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documentos-proyectos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Los usuarios pueden subir documentos a sus carpetas
CREATE POLICY "Los usuarios pueden subir documentos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documentos-proyectos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Los usuarios pueden actualizar sus documentos
CREATE POLICY "Los usuarios pueden actualizar sus documentos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'documentos-proyectos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Los usuarios pueden eliminar sus documentos
CREATE POLICY "Los usuarios pueden eliminar sus documentos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documentos-proyectos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- ESTRUCTURA DE CARPETAS
-- ============================================
-- Los archivos se organizarán así:
-- {user_id}/{proyecto_id}/{categoria}/{filename}
-- 
-- Ejemplo:
-- abc123-user/xyz789-proyecto/licencias/licencia-construccion-2024.pdf
-- abc123-user/xyz789-proyecto/planos/plano-arquitectonico-v2.dwg
