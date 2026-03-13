-- Ver detalles de índices creados con tamaño
SELECT
  i.tablename,
  i.indexname,
  pg_size_pretty(pg_relation_size(quote_ident(i.schemaname)||'.'||quote_ident(i.indexname))::bigint) as index_size,
  substring(i.indexdef from 'USING (.+?) ') as index_type,
  CASE
    WHEN i.indexdef LIKE '%WHERE%' THEN 'Parcial'
    ELSE 'Completo'
  END as coverage
FROM pg_indexes i
WHERE i.tablename IN ('documentos_proyecto', 'documentos_vivienda', 'documentos_cliente')
  AND i.indexname LIKE 'idx_docs_%'
ORDER BY i.tablename, i.indexname;
