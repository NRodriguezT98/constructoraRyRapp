-- Verificar índices creados para optimización de documentos

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('documentos_proyecto', 'documentos_vivienda', 'documentos_cliente')
  AND indexname LIKE 'idx_docs_%'
ORDER BY tablename, indexname;
