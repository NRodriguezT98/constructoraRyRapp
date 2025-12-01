-- Ver si RLS está habilitado en cada tabla
SELECT
    'TABLA: ' || tablename as info,
    CASE WHEN rowsecurity THEN 'RLS HABILITADO ✅' ELSE 'RLS DESHABILITADO ❌' END as estado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'documentos_%'
ORDER BY tablename;
