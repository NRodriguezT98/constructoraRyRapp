-- Verificar schema exacto de documentos_cliente
SELECT
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'documentos_cliente'
ORDER BY ordinal_position;

-- Verificar si estado es ENUM
SELECT
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%estado%'
ORDER BY t.typname, e.enumsortorder;
