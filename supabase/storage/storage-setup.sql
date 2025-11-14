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
-- ELIMINAR POLÍTICAS ANTIGUAS
-- ============================================
DROP POLICY IF EXISTS "Los usuarios pueden ver documentos de sus proyectos" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden subir documentos" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus documentos" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus documentos" ON storage.objects;

-- ============================================
-- POLÍTICAS DE STORAGE (ACCESO COMPARTIDO)
-- ============================================

-- Política: Todos los usuarios autenticados pueden VER documentos
CREATE POLICY "Usuarios autenticados pueden ver documentos de proyectos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documentos-proyectos'
    AND auth.uid() IS NOT NULL
);

-- Política: Todos los usuarios autenticados pueden SUBIR documentos
CREATE POLICY "Usuarios autenticados pueden subir documentos de proyectos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documentos-proyectos'
    AND auth.uid() IS NOT NULL
);

-- Política: Todos los usuarios autenticados pueden ACTUALIZAR documentos
CREATE POLICY "Usuarios autenticados pueden actualizar documentos de proyectos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'documentos-proyectos'
    AND auth.uid() IS NOT NULL
);

-- Política: Solo ADMINISTRADORES pueden ELIMINAR documentos físicamente
CREATE POLICY "Solo administradores pueden eliminar documentos de proyectos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documentos-proyectos'
    AND EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid() AND rol = 'Administrador'
    )
);

-- ============================================
-- ESTRUCTURA DE CARPETAS
-- ============================================
-- Los archivos se organizarán así:
-- {proyecto_id}/{categoria}/{filename}
--
-- Ejemplo:
-- 9de0afee-05f6-4a5c-9951-2411e7eed9e4/licencias/1731600000_licencia_construccion.pdf
-- 9de0afee-05f6-4a5c-9951-2411e7eed9e4/planos/1731600100_plano_arquitectonico.dwg
-- 9de0afee-05f6-4a5c-9951-2411e7eed9e4/certificados/1731600200_certificado_tradicion.pdf
--
-- PERMISOS:
-- - SELECT: Todos los usuarios autenticados
-- - INSERT: Todos los usuarios autenticados
-- - UPDATE: Todos los usuarios autenticados
-- - DELETE: Solo Administradores (eliminación física)
--
-- AUDITORÍA:
-- El campo 'subido_por' en la tabla documentos_proyecto registra quién subió cada archivo
