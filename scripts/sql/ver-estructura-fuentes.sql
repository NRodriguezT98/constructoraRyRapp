-- Verificar estructura de tabla fuentes_pago
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'fuentes_pago'
  AND column_name IN ('estado_fuente', 'fecha_inactivacion', 'razon_inactivacion')
ORDER BY ordinal_position;

-- Verificar constraints
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'fuentes_pago'
ORDER BY con.contype, con.conname;
