-- Verificar que la columna existe y tiene la estructura correcta
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name = 'documento_identidad_titulo';

-- Debería retornar:
-- column_name                  | data_type         | character_maximum_length | is_nullable | column_default
-- documento_identidad_titulo   | character varying | 200                      | YES         | NULL
