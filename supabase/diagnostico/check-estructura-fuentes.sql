-- Verificar estructura de fuentes_pago para entender el problema de FK
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'fuentes_pago'
AND column_name LIKE '%tipo%'
ORDER BY ordinal_position;
