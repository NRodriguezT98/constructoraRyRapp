SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('creditos_constructora', 'cuotas_credito')
  AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY table_name, grantee, privilege_type;
