-- ============================================
-- GENERAR SCHEMA REFERENCE - DOCUMENTOS_CLIENTE
-- ============================================
-- Solo la tabla documentos_cliente para verificar
-- ============================================

SELECT
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name = 'documentos_cliente'
ORDER BY c.ordinal_position;
