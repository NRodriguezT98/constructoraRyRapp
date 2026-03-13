-- ============================================
-- DIAGNÓSTICO SIMPLE: Estado de Limbo
-- ============================================

-- 1. Cliente Pedrito
SELECT
  '👤 CLIENTE' as tipo,
  id,
  nombres || ' ' || apellidos as nombre_completo,
  numero_documento,
  estado
FROM clientes
WHERE numero_documento = '1233333';

-- 2. Vivienda Casa 5
SELECT
  '🏠 VIVIENDA' as tipo,
  v.id,
  v.numero,
  m.nombre as manzana,
  v.estado,
  v.cliente_id,
  v.negociacion_id
FROM viviendas v
INNER JOIN manzanas m ON v.manzana_id = m.id
WHERE v.numero = '5' AND m.nombre = 'Manzana A';

-- 3. Negociaciones del cliente
SELECT
  '📋 NEGOCIACIONES' as tipo,
  n.id,
  n.cliente_id,
  n.vivienda_id,
  n.estado
FROM negociaciones n
INNER JOIN clientes c ON n.cliente_id = c.id
WHERE c.numero_documento = '1233333';

-- 4. Fuentes de pago
SELECT
  '💰 FUENTES' as tipo,
  COUNT(*) as total
FROM fuentes_pago fp
WHERE fp.negociacion_id IN (
  SELECT n.id FROM negociaciones n
  INNER JOIN clientes c ON n.cliente_id = c.id
  WHERE c.numero_documento = '1233333'
);
