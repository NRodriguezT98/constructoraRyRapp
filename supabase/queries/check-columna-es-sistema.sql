-- Verificar columna es_sistema
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'categorias_documento'
  AND column_name = 'es_sistema';
