-- Verificar políticas RLS para las 3 tablas de documentos
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
WHERE tablename IN ('documentos_proyecto', 'documentos_vivienda', 'documentos_cliente')
ORDER BY tablename, policyname;

-- Ver si RLS está habilitado
SELECT
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('documentos_proyecto', 'documentos_vivienda', 'documentos_cliente')
ORDER BY tablename;
