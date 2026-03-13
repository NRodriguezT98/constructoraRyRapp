-- Ver columnas de tipos_fuentes_pago
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tipos_fuentes_pago'
ORDER BY ordinal_position;
