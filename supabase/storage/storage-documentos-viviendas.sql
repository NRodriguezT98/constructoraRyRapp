-- ============================================================================
-- SUPABASE STORAGE: Configuración Bucket Documentos Viviendas
-- Descripción: Crea bucket y políticas RLS para documentos de viviendas
-- Fecha: 2025-11-07
-- ============================================================================

-- 1. Crear bucket para documentos de viviendas (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documentos-viviendas',
    'documentos-viviendas',
    false, -- Privado, requiere autenticación
    104857600, -- 100MB límite por archivo
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- .docx
        'application/msword', -- .doc
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', -- .xlsx
        'application/vnd.ms-excel', -- .xls
        'application/vnd.ms-powerpoint', -- .ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- .pptx
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'text/plain',
        'application/dwg', -- AutoCAD
        'image/vnd.dwg',
        'application/dxf' -- AutoCAD DXF
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Usuarios pueden ver documentos de viviendas" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir documentos de viviendas" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar documentos de viviendas" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar documentos de viviendas" ON storage.objects;

-- ============================================================================
-- POLÍTICAS RLS DE STORAGE
-- ============================================================================

-- 3. POLICY: SELECT - Ver documentos
-- Estructura de paths: {vivienda_id}/{filename}
CREATE POLICY "Usuarios pueden ver documentos de viviendas"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documentos-viviendas'
    AND auth.uid() IS NOT NULL
);

-- 4. POLICY: INSERT - Subir documentos
CREATE POLICY "Usuarios pueden subir documentos de viviendas"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documentos-viviendas'
    AND auth.uid() IS NOT NULL
);

-- 5. POLICY: UPDATE - Actualizar documentos
CREATE POLICY "Usuarios pueden actualizar documentos de viviendas"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'documentos-viviendas'
    AND auth.uid() IS NOT NULL
);

-- 6. POLICY: DELETE - Eliminar documentos (solo Administradores)
CREATE POLICY "Solo admins pueden eliminar documentos de viviendas"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documentos-viviendas'
    AND EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid() AND rol = 'Administrador'
    )
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que el bucket fue creado
SELECT
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'documentos-viviendas';

-- Verificar políticas creadas
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
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%viviendas%'
ORDER BY policyname;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
--
-- ESTRUCTURA DE PATHS:
-- {vivienda_id}/{timestamp}_{nombre_archivo}.{ext}
--
-- EJEMPLO:
-- a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6/1730995200000_escritura_casa_A7.pdf
-- a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6/1730995300000_plano_arquitectonico.dwg
--
-- PERMISOS:
-- - SELECT: Todos los usuarios autenticados pueden ver documentos
-- - INSERT: Todos los usuarios autenticados pueden subir documentos
-- - UPDATE: Todos los usuarios autenticados pueden actualizar metadata
-- - DELETE: Solo Administradores pueden eliminar físicamente
--
-- SOFT DELETE:
-- Los documentos se marcan como 'eliminado' en la tabla documentos_vivienda
-- pero el archivo físico permanece en Storage (solo admins pueden eliminar)
--
-- ============================================================================
