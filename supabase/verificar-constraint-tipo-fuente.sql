-- =====================================================
-- Verificación: Ver el CHECK constraint actual de fuentes_pago
-- =====================================================

-- Ver la definición exacta del constraint
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.fuentes_pago'::regclass
  AND contype = 'c' -- 'c' = CHECK constraint
  AND conname LIKE '%tipo%';

-- Resultado esperado: ver qué valores exactos están permitidos
