-- Ver definición del constraint valid_accion en audit_log
SELECT pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conname = 'valid_accion'
  AND conrelid = 'audit_log'::regclass;
