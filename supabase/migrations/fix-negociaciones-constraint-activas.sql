-- =====================================================
-- Migración: Permitir múltiples negociaciones para mismo cliente-vivienda
-- Solo si las anteriores están Canceladas o Completadas
-- =====================================================
-- Fecha: 2025-10-21
-- Problema: El constraint UNIQUE(cliente_id, vivienda_id) impedía crear
--           nuevas negociaciones incluso si las anteriores estaban canceladas
-- Solución: Eliminar constraint UNIQUE global y crear UNIQUE INDEX PARCIAL
--           que solo aplique a negociaciones activas
-- =====================================================

-- PASO 1: Eliminar constraint único global
ALTER TABLE public.negociaciones
DROP CONSTRAINT IF EXISTS negociaciones_cliente_vivienda_unica;

-- PASO 2: Crear índice único parcial (solo para negociaciones activas)
-- Solo permite 1 negociación activa por cliente-vivienda
-- Estados activos: 'En Proceso', 'Cierre Financiero', 'Activa'
-- Estados inactivos (permiten nueva negociación): 'Completada', 'Cancelada', 'Renuncia'
CREATE UNIQUE INDEX IF NOT EXISTS idx_negociaciones_activas_cliente_vivienda_unica
ON public.negociaciones(cliente_id, vivienda_id)
WHERE estado IN ('En Proceso', 'Cierre Financiero', 'Activa');

-- COMENTARIO: Ahora un cliente puede tener múltiples negociaciones con la misma vivienda,
-- siempre y cuando solo UNA esté en estado activo a la vez.
-- Ejemplo válido:
--   - Cliente A + Vivienda 1 → Negociación 1 (Cancelada) ✅
--   - Cliente A + Vivienda 1 → Negociación 2 (En Proceso) ✅
-- Ejemplo inválido:
--   - Cliente A + Vivienda 1 → Negociación 1 (En Proceso) ✅
--   - Cliente A + Vivienda 1 → Negociación 2 (En Proceso) ❌ (violación)

-- Verificación: Contar negociaciones duplicadas que causarían conflicto
SELECT
  cliente_id,
  vivienda_id,
  COUNT(*) as negociaciones_activas,
  STRING_AGG(estado::text, ', ') as estados
FROM public.negociaciones
WHERE estado IN ('En Proceso', 'Cierre Financiero', 'Activa')
GROUP BY cliente_id, vivienda_id
HAVING COUNT(*) > 1;

-- Si la consulta anterior devuelve filas, significa que hay negociaciones duplicadas activas
-- En ese caso, manualmente se debe decidir cuál cancelar antes de ejecutar la migración
