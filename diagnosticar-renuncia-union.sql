-- Diagnóstico unificado: todo en una sola query
SELECT
  'constraint_valid_accion' as tipo,
  pg_get_constraintdef(oid) as valor
FROM pg_constraint WHERE conname = 'valid_accion'

UNION ALL

SELECT
  'trigger_renuncias_' || trigger_name,
  event_manipulation || ' ' || action_timing || ' -> ' || action_statement
FROM information_schema.triggers
WHERE event_object_table = 'renuncias' AND event_object_schema = 'public'

UNION ALL

SELECT
  'trigger_negociaciones_' || trigger_name,
  event_manipulation || ' ' || action_timing
FROM information_schema.triggers
WHERE event_object_table = 'negociaciones' AND event_object_schema = 'public'

UNION ALL

SELECT
  'auditlog_email_nullable',
  is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_log' AND column_name = 'usuario_email'

UNION ALL

SELECT
  'renuncias_constraint_' || conname,
  pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'renuncias'::regclass

UNION ALL

SELECT
  'negociaciones_estado_check',
  pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'negociaciones'::regclass
  AND conname LIKE '%estado%'

ORDER BY tipo;
