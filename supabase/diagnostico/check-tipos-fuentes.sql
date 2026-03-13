-- Verificar si tabla tipos_fuentes_pago existe
SELECT COUNT(*) as existe_tipos_fuentes_pago
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'tipos_fuentes_pago';
