SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('documentos_cliente','documentos_vivienda','documentos_proyecto')
ORDER BY tablename, cmd;
