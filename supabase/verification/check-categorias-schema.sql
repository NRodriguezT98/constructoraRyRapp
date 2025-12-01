-- Verificar estructura de categorias_documento
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'categorias_documento'
ORDER BY ordinal_position;
