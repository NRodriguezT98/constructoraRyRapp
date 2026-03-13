-- Verificar estructura de fuentes_pago para FK a tipos_fuentes_pago
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'fuentes_pago'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar constraints FK
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
WHERE tc.table_name = 'fuentes_pago'
  AND tc.constraint_type = 'FOREIGN KEY';
