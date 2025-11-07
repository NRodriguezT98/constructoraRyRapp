-- ============================================================================
-- VERIFICACIÓN: Políticas Storage documentos-viviendas
-- ============================================================================

-- 1. Verificar que el bucket existe
SELECT
    id,
    name,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as tipos_permitidos
FROM storage.buckets
WHERE id = 'documentos-viviendas';

-- 2. Verificar políticas creadas
SELECT
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%viviendas%'
ORDER BY cmd, policyname;

-- 3. Contar políticas activas
SELECT
    cmd as operacion,
    count(*) as total_politicas
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%viviendas%'
GROUP BY cmd
ORDER BY cmd;
