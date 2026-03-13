-- Ver estructura de requisitos_fuentes_pago_config
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'requisitos_fuentes_pago_config'
ORDER BY ordinal_position;
