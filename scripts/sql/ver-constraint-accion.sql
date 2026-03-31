-- Ver constraint de accion en audit_log
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'valid_accion';
