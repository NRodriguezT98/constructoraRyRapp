-- Verificación final: Estado limpio de categorías
SELECT
  '✅ TOTAL CATEGORÍAS' as metrica,
  COUNT(*)::text as valor
FROM categorias_documento
UNION ALL
SELECT
  '✅ Globales (es_global=true)',
  COUNT(*)::text
FROM categorias_documento
WHERE es_global = true
UNION ALL
SELECT
  '❌ No globales (es_global=false)',
  COUNT(*)::text
FROM categorias_documento
WHERE es_global = false
UNION ALL
SELECT
  '❌ Sin módulos',
  COUNT(*)::text
FROM categorias_documento
WHERE modulos_permitidos IS NULL OR modulos_permitidos = '{}'
UNION ALL
SELECT
  '📁 Categorías Proyectos',
  COUNT(*)::text
FROM categorias_documento
WHERE 'proyectos' = ANY(modulos_permitidos)
UNION ALL
SELECT
  '👥 Categorías Clientes',
  COUNT(*)::text
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
UNION ALL
SELECT
  '🏠 Categorías Viviendas',
  COUNT(*)::text
FROM categorias_documento
WHERE 'viviendas' = ANY(modulos_permitidos);
