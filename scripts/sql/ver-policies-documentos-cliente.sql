-- Ver políticas RLS actuales de documentos_cliente
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
WHERE tablename = 'documentos_cliente'
ORDER BY policyname;
