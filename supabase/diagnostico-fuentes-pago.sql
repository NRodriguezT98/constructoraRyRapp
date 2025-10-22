-- =====================================================
-- Verificación completa: Fuentes de pago
-- =====================================================

-- 1. Ver constraint actual
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.fuentes_pago'::regclass
  AND contype = 'c'
  AND conname LIKE '%tipo%';

-- 2. Ver tipos de fuentes existentes en la tabla
SELECT
  tipo,
  COUNT(*) as cantidad,
  STRING_AGG(DISTINCT negociacion_id::text, ', ') as negociaciones
FROM public.fuentes_pago
GROUP BY tipo
ORDER BY tipo;

-- 3. Ver si hay fuentes con tipos "raros" que no coinciden con el constraint
SELECT
  id,
  negociacion_id,
  tipo,
  monto_aprobado,
  estado
FROM public.fuentes_pago
WHERE tipo NOT IN (
  'Cuota Inicial',
  'Crédito Hipotecario',
  'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación'
);

-- 4. Ver estructura de la tabla
SELECT
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'fuentes_pago'
  AND table_schema = 'public'
  AND column_name = 'tipo';
