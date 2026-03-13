-- 🔍 DIAGNÓSTICO COMPLETO: Pendiente Mi Casa Ya
-- Ver exactamente por qué sigue apareciendo

-- 1️⃣ Ver el pendiente problemático
SELECT
  'PENDIENTE MI CASA YA' as tipo,
  dp.id,
  dp.tipo_documento,
  dp.fuente_pago_id,
  dp.cliente_id,
  dp.estado,
  dp.metadata,
  dp.fecha_creacion,
  c.nombres || ' ' || c.apellidos as cliente
FROM documentos_pendientes dp
LEFT JOIN clientes c ON c.id = dp.cliente_id
WHERE dp.tipo_documento ILIKE '%mi casa ya%'
  AND dp.estado = 'Pendiente';

-- 2️⃣ Verificar si la fuente_pago existe o fue eliminada
SELECT
  'VERIFICACIÓN FUENTE' as tipo,
  dp.fuente_pago_id,
  CASE
    WHEN fp.id IS NULL THEN '❌ FUENTE ELIMINADA (huérfano)'
    ELSE '✅ Fuente existe'
  END as estado_fuente,
  fp.tipo as tipo_fuente,
  fp.entidad,
  fp.negociacion_id,
  n.estado as estado_negociacion
FROM documentos_pendientes dp
LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
LEFT JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE dp.tipo_documento ILIKE '%mi casa ya%'
  AND dp.estado = 'Pendiente';

-- 3️⃣ Ver TODAS las fuentes activas del cliente
SELECT
  'FUENTES ACTIVAS' as tipo,
  fp.id,
  fp.tipo,
  fp.entidad,
  fp.monto_aprobado,
  n.estado as negociacion_estado,
  c.nombres || ' ' || c.apellidos as cliente
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN clientes c ON c.id = n.cliente_id
WHERE c.nombres ILIKE '%luis%david%'
  OR c.apellidos ILIKE '%salazar%'
ORDER BY fp.fecha_creacion DESC;
