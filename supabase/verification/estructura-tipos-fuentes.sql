-- Ver estructura de tipos_fuentes_pago
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tipos_fuentes_pago'
ORDER BY ordinal_position;
