-- Ver políticas RLS para UPDATE en fuentes_pago
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'fuentes_pago'
  AND cmd IN ('UPDATE', 'ALL')
ORDER BY policyname;

-- Ver si la tabla tiene RLS habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'fuentes_pago';
