-- Consultar el trigger que falla en abonos_historial
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'abonos_historial'
ORDER BY trigger_name;
