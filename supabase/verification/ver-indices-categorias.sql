-- Ver todos los índices de la tabla categorias_documento
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'categorias_documento'
ORDER BY indexname;
