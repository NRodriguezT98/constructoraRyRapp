-- Verificar columnas REALES de la tabla negociaciones
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'negociaciones'
  AND table_schema = 'public'
ORDER BY ordinal_position;
