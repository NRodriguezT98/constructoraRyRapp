-- Verificar el esquema actual de la tabla documentos_cliente
-- Ejecutar en Supabase SQL Editor

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM
  information_schema.columns
WHERE
  table_schema = 'public'
  AND table_name = 'documentos_cliente'
ORDER BY
  ordinal_position;

-- Si aparece 'es_documento_identidad', hay que eliminarlo con:
-- ALTER TABLE documentos_cliente DROP COLUMN IF EXISTS es_documento_identidad;
