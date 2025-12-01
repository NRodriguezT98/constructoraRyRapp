-- Ver tipo de columna subido_por
SELECT
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'documentos_cliente'
AND column_name = 'subido_por';
