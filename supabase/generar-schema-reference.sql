-- ============================================
-- GENERAR SCHEMA REFERENCE COMPLETO
-- ============================================
-- Consulta todas las tablas del schema public con sus columnas
-- ============================================

SELECT
  t.table_name,
  json_agg(
    json_build_object(
      'column_name', c.column_name,
      'data_type', c.data_type,
      'is_nullable', c.is_nullable,
      'column_default', c.column_default,
      'character_maximum_length', c.character_maximum_length
    ) ORDER BY c.ordinal_position
  ) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT LIKE 'pg_%'
  AND t.table_name NOT LIKE 'sql_%'
GROUP BY t.table_name
ORDER BY t.table_name;
