-- Ver tipo específico de la columna estado
SELECT
    column_name,
    data_type,
    udt_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'documentos_cliente'
  AND column_name = 'estado';

-- Ver si existe el tipo ENUM estado_documento_enum
SELECT enumlabel as valores_permitidos
FROM pg_enum
WHERE enumtypid = (
    SELECT oid
    FROM pg_type
    WHERE typname = 'estado_documento_enum'
)
ORDER BY enumsortorder;
