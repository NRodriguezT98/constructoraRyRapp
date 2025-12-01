-- Ver foreign keys de documentos_cliente
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'documentos_cliente'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Ver si existe la columna usuario_id
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'documentos_cliente'
  AND column_name LIKE '%usuario%';
