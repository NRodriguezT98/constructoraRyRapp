-- Verificar CHECK constraint de estado en todas las tablas de documentos
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE contype = 'c'
  AND conrelid::regclass::text LIKE 'documentos_%'
  AND conname LIKE '%estado%';
