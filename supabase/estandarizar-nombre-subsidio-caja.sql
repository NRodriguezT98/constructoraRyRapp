-- ============================================
-- ESTANDARIZAR NOMBRE: Subsidio Caja de Compensación
-- ============================================
--
-- Problema: Existen dos variantes del mismo nombre:
--   1. "Subsidio Caja de Compensación" (correcto, formal)
--   2. "Subsidio Caja Compensación" (sin "de", incorrecto)
--
-- Solución: Estandarizar a "Subsidio Caja de Compensación"
-- ============================================

BEGIN;

-- 1. Actualizar tipos_fuentes_pago
UPDATE tipos_fuentes_pago
SET nombre = 'Subsidio Caja de Compensación'
WHERE nombre = 'Subsidio Caja Compensación'; -- sin "de"

-- 2. Actualizar requisitos_fuentes_pago_config
UPDATE requisitos_fuentes_pago_config
SET tipo_fuente = 'Subsidio Caja de Compensación'
WHERE tipo_fuente = 'Subsidio Caja Compensación'; -- sin "de"

-- 3. Actualizar fuentes_pago reales (si existen)
UPDATE fuentes_pago
SET tipo = 'Subsidio Caja de Compensación'
WHERE tipo = 'Subsidio Caja Compensación'; -- sin "de"

-- 4. Verificar resultado
SELECT
  'tipos_fuentes_pago' as tabla,
  nombre as valor_actual,
  COUNT(*) as cantidad
FROM tipos_fuentes_pago
WHERE nombre ILIKE '%subsidio%caja%'
GROUP BY nombre

UNION ALL

SELECT
  'requisitos_fuentes_pago_config' as tabla,
  tipo_fuente as valor_actual,
  COUNT(*) as cantidad
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente ILIKE '%subsidio%caja%'
GROUP BY tipo_fuente

UNION ALL

SELECT
  'fuentes_pago' as tabla,
  tipo as valor_actual,
  COUNT(*) as cantidad
FROM fuentes_pago
WHERE tipo ILIKE '%subsidio%caja%'
GROUP BY tipo

ORDER BY tabla, valor_actual;

COMMIT;

-- Resultado esperado: Solo debe aparecer "Subsidio Caja de Compensación" (con "de")
