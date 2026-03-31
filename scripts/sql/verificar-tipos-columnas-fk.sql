-- Verificar tipos de columnas para FK
SELECT
  'documentos_vivienda.subido_por' as columna,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'documentos_vivienda' AND column_name = 'subido_por'
UNION ALL
SELECT
  'usuarios.id' as columna,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'usuarios' AND column_name = 'id'
UNION ALL
SELECT
  'documentos_proyecto.subido_por' as columna,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'documentos_proyecto' AND column_name = 'subido_por';
