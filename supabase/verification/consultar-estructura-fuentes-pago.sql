-- Consultar estructura de fuentes_pago
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'fuentes_pago'
  AND table_schema = 'public'
ORDER BY ordinal_position;
