-- 🔍 DIAGNÓSTICO ULTRA DETALLADO: Pendiente Mi Casa Ya
-- Ver EXACTAMENTE por qué sigue apareciendo

-- 1️⃣ Ver el pendiente con TODOS sus datos
SELECT
  '=== PENDIENTE ===' as seccion,
  dp.id as pendiente_id,
  dp.fuente_pago_id,
  dp.cliente_id,
  dp.tipo_documento,
  dp.estado,
  dp.metadata,
  dp.fecha_creacion
FROM documentos_pendientes dp
WHERE dp.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND dp.estado = 'Pendiente'
  AND (dp.tipo_documento ILIKE '%mi casa ya%'
       OR dp.metadata->>'tipo_fuente' ILIKE '%mi casa ya%');

-- 2️⃣ Ver si la fuente_pago existe
SELECT
  '=== FUENTE_PAGO ===' as seccion,
  fp.id as fuente_id,
  fp.tipo,
  fp.entidad,
  fp.negociacion_id,
  fp.estado,
  fp.fecha_creacion,
  n.estado as negociacion_estado,
  n.version_actual
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE fp.id IN (
  SELECT fuente_pago_id
  FROM documentos_pendientes
  WHERE cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
    AND estado = 'Pendiente'
);

-- 3️⃣ Ver TODAS las fuentes ACTIVAS del cliente
SELECT
  '=== FUENTES ACTIVAS ===' as seccion,
  fp.id,
  fp.tipo,
  fp.entidad,
  fp.negociacion_id,
  n.estado as negociacion_estado,
  n.version_actual
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE n.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND n.estado = 'Activa'
ORDER BY fp.fecha_creacion DESC;

-- 4️⃣ Contar total de pendientes
SELECT
  '=== RESUMEN ===' as seccion,
  COUNT(*) as total_pendientes,
  COUNT(CASE WHEN fp.id IS NULL THEN 1 END) as huerfanos,
  COUNT(CASE WHEN fp.id IS NOT NULL THEN 1 END) as con_fuente_valida
FROM documentos_pendientes dp
LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
WHERE dp.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND dp.estado = 'Pendiente';
