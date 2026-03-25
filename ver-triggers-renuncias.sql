-- Ver las filas 19-29 de la diagnóstico
SELECT
  'trigger_renuncias_' || trigger_name as tipo,
  event_manipulation || ' ' || action_timing || ' -> ' || action_statement as valor
FROM information_schema.triggers
WHERE event_object_table = 'renuncias' AND event_object_schema = 'public'
ORDER BY trigger_name, event_manipulation;
