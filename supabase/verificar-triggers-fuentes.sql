-- Verificar triggers activos en fuentes_pago
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'fuentes_pago'
ORDER BY trigger_name;
