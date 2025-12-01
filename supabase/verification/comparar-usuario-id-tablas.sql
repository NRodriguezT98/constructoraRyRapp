-- Comparar columnas entre las 3 tablas de documentos
SELECT 'documentos_proyecto' as tabla, column_name
FROM information_schema.columns
WHERE table_name = 'documentos_proyecto'
  AND column_name LIKE '%usuario%'

UNION ALL

SELECT 'documentos_vivienda' as tabla, column_name
FROM information_schema.columns
WHERE table_name = 'documentos_vivienda'
  AND column_name LIKE '%usuario%'

UNION ALL

SELECT 'documentos_cliente' as tabla, column_name
FROM information_schema.columns
WHERE table_name = 'documentos_cliente'
  AND column_name LIKE '%usuario%';
