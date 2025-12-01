-- Verificar si documentos_cliente tiene CHECK constraint en estado
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE contype = 'c'
  AND conrelid = 'documentos_cliente'::regclass
  AND conname LIKE '%estado%';
