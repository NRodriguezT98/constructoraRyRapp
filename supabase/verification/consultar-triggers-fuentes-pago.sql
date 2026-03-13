-- Consultar triggers en fuentes_pago
SELECT
  t.trigger_name,
  t.event_manipulation,
  t.action_statement,
  t.action_timing
FROM information_schema.triggers t
WHERE t.event_object_table = 'fuentes_pago'
  AND t.trigger_schema = 'public'
ORDER BY t.trigger_name;
