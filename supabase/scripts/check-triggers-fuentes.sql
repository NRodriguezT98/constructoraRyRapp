SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'fuentes_pago'
ORDER BY trigger_name;
