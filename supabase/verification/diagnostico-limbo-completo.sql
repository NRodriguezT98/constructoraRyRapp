-- ============================================
-- DIAGNÓSTICO COMPLETO: Estado de Limbo
-- ============================================

-- 1. Estado del cliente Pedrito
SELECT
  '👤 CLIENTE' as tipo,
  id,
  nombres || ' ' || apellidos as nombre_completo,
  numero_documento,
  estado,
  fecha_actualizacion
FROM clientes
WHERE numero_documento = '1233333';

-- 2. Estado de la vivienda Casa 5
SELECT
  '🏠 VIVIENDA' as tipo,
  v.id,
  v.numero,
  m.nombre as manzana,
  v.estado,
  v.cliente_id,
  v.negociacion_id,
  v.fecha_actualizacion
FROM viviendas v
INNER JOIN manzanas m ON v.manzana_id = m.id
WHERE v.numero = '5' AND m.nombre = 'Manzana A';

-- 3. Negociaciones del cliente (activas o huérfanas)
SELECT
  '📋 NEGOCIACIONES' as tipo,
  n.id,
  n.cliente_id,
  n.vivienda_id,
  n.estado,
  n.fecha_creacion,
  n.fecha_actualizacion
FROM negociaciones n
INNER JOIN clientes c ON n.cliente_id = c.id
WHERE c.numero_documento = '1233333';

-- 4. Fuentes de pago huérfanas
SELECT
  '💰 FUENTES DE PAGO' as tipo,
  fp.id,
  fp.negociacion_id,
  fp.tipo,
  fp.estado,
  fp.monto_aprobado
FROM fuentes_pago fp
WHERE fp.negociacion_id IN (
  SELECT n.id FROM negociaciones n
  INNER JOIN clientes c ON n.cliente_id = c.id
  WHERE c.numero_documento = '1233333'
);

-- 5. Verificar si hay tabla de abonos/pagos
-- (Comentado porque puede no existir)
-- SELECT '💵 ABONOS' as tipo, COUNT(*) as total FROM abonos;


-- 6. Historial de negociaciones
SELECT
  '📜 HISTORIAL' as tipo,
  nh.id,
  nh.negociacion_id,
  nh.evento,
  nh.estado_anterior,
  nh.estado_nuevo,
  nh.fecha
FROM negociaciones_historial nh
WHERE nh.negociacion_id IN (
  SELECT n.id FROM negociaciones n
  INNER JOIN clientes c ON n.cliente_id = c.id
  WHERE c.numero_documento = '1233333'
)
ORDER BY nh.fecha DESC
LIMIT 10;
