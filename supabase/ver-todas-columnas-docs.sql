-- Ver TODAS las columnas de documentos_cliente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'documentos_cliente'
ORDER BY ordinal_position;
