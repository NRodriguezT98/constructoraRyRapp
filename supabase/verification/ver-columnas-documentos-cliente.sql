-- Ver todas las columnas de la tabla
SELECT
    'COLUMNA' as tipo,
    column_name as nombre,
    data_type as tipo_dato,
    udt_name as tipo_definido
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'documentos_cliente'
ORDER BY ordinal_position;
