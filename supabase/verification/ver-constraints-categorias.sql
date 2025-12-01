-- Ver todos los constraints e índices de la tabla categorias_documento
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'categorias_documento'::regclass
ORDER BY conname;
