-- Verificar vistas y reglas que usan documentos_vivienda
SELECT
  'VIEW' as tipo,
  viewname as nombre,
  definition
FROM pg_views
WHERE definition LIKE '%documentos_vivienda%'
UNION ALL
SELECT
  'RULE' as tipo,
  tablename || '.' || rulename as nombre,
  NULL as definition
FROM pg_rules
WHERE tablename = 'documentos_vivienda';
