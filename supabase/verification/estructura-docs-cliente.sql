-- Ver estructura de documentos_cliente
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'documentos_cliente'
ORDER BY ordinal_position;
