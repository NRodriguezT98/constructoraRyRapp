-- ============================================
-- FIX: Consolidar Boleta de Registro única
-- ============================================

BEGIN;

-- 1️⃣ Ver configuración actual
SELECT
  'ANTES' as estado,
  id,
  tipo_fuente,
  titulo,
  alcance,
  activo
FROM requisitos_fuentes_pago_config
WHERE titulo ILIKE '%boleta%'
ORDER BY tipo_fuente;

-- 2️⃣ Desactivar Boletas duplicadas (dejar solo una)
UPDATE requisitos_fuentes_pago_config
SET activo = false
WHERE titulo ILIKE '%boleta%registro%'
  AND tipo_fuente != 'Crédito Hipotecario';  -- Dejar solo la de Crédito Hipotecario

-- 3️⃣ Marcar la única Boleta como COMPARTIDA
UPDATE requisitos_fuentes_pago_config
SET alcance = 'COMPARTIDO_CLIENTE'
WHERE titulo ILIKE '%boleta%registro%'
  AND tipo_fuente = 'Crédito Hipotecario'
  AND activo = true;

-- 4️⃣ Verificar resultado
SELECT
  'DESPUES' as estado,
  id,
  tipo_fuente,
  titulo,
  alcance,
  activo
FROM requisitos_fuentes_pago_config
WHERE titulo ILIKE '%boleta%'
ORDER BY activo DESC, tipo_fuente;

-- 5️⃣ Test: Ver pendientes de Pedrito
SELECT
  'TEST FINAL' as seccion,
  tipo_documento,
  alcance,
  tipo_fuente,
  COUNT(*) as veces
FROM vista_documentos_pendientes_fuentes
WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
  AND tipo_documento ILIKE '%boleta%'
GROUP BY tipo_documento, alcance, tipo_fuente;

COMMIT;
