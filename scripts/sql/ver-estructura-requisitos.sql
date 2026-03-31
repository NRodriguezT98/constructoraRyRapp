-- Ver estructura de requisitos_fuentes_pago_config
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'requisitos_fuentes_pago_config'
ORDER BY ordinal_position;

-- Ver datos de ejemplo
SELECT * FROM requisitos_fuentes_pago_config LIMIT 3;
