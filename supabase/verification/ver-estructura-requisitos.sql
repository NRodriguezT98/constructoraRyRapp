-- Ver estructura de la tabla requisitos_fuentes_pago_config
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'requisitos_fuentes_pago_config'
ORDER BY ordinal_position;
