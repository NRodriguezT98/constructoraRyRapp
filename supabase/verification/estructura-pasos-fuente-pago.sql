-- Ver estructura de la tabla pasos_fuente_pago
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'pasos_fuente_pago'
ORDER BY ordinal_position;
