-- =====================================================
-- Verificación: Confirmar que la migración se aplicó correctamente
-- =====================================================

-- 1. Ver todos los índices únicos en la tabla negociaciones
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'negociaciones'
  AND (indexdef LIKE '%UNIQUE%' OR indexname LIKE '%unica%')
ORDER BY indexname;

-- Resultado esperado:
-- ✅ idx_negociaciones_activas_cliente_vivienda_unica (nuevo índice parcial)
-- ❌ negociaciones_cliente_vivienda_unica NO debe aparecer (constraint eliminado)

-- 2. Ver constraints únicos (no debe aparecer el viejo)
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.negociaciones'::regclass
  AND contype = 'u'; -- 'u' = UNIQUE constraint

-- Resultado esperado:
-- NO debe aparecer negociaciones_cliente_vivienda_unica

-- 3. Probar el nuevo comportamiento (simulación)
-- Esta query muestra cuántas negociaciones tiene cada cliente-vivienda por estado
SELECT
  cliente_id,
  vivienda_id,
  estado,
  COUNT(*) as cantidad
FROM public.negociaciones
GROUP BY cliente_id, vivienda_id, estado
ORDER BY cliente_id, vivienda_id, estado;

-- Ahora puedes tener:
-- Cliente X + Vivienda Y → 1 Cancelada + 1 En Proceso ✅
-- Cliente X + Vivienda Y → 1 Completada + 1 Activa ✅
-- Cliente X + Vivienda Y → 2 En Proceso ❌ (esto seguirá bloqueado, correcto)
