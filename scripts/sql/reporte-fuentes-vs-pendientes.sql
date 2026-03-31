-- 📊 REPORTE COMPLETO: Fuentes de Pago vs Documentos Pendientes
-- Cliente: Luis David Salazar Moreno

-- 1️⃣ FUENTES DE PAGO ACTIVAS
SELECT
  '🏦 FUENTE ACTIVA' as tipo,
  fp.id,
  fp.tipo,
  fp.entidad,
  fp.monto_aprobado,
  fp.carta_aprobacion_url,
  CASE
    WHEN fp.carta_aprobacion_url IS NOT NULL THEN '✅ Tiene carta'
    WHEN fp.tipo = 'Cuota Inicial' THEN '⚪ No requiere'
    ELSE '❌ SIN CARTA (debería tener pendiente)'
  END as estado_carta,
  n.version_actual as version_negociacion
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE n.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND n.estado = 'Activa'
ORDER BY fp.fecha_creacion;

-- 2️⃣ DOCUMENTOS PENDIENTES
SELECT
  '📄 PENDIENTE' as tipo,
  dp.id,
  dp.tipo_documento,
  dp.fuente_pago_id,
  dp.metadata->>'tipo_fuente' as tipo_fuente,
  dp.prioridad,
  CASE
    WHEN fp.id IS NULL THEN '❌ HUERFANO (fuente eliminada)'
    WHEN fp.id IS NOT NULL THEN '✅ VALIDO (fuente existe)'
  END as validez,
  fp.tipo as tipo_fuente_real,
  fp.entidad as entidad_fuente
FROM documentos_pendientes dp
LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
WHERE dp.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND dp.estado = 'Pendiente';

-- 3️⃣ CRUCE: ¿Hay fuentes sin carta pero sin pendiente?
SELECT
  '⚠️ INCONSISTENCIA' as tipo,
  fp.tipo,
  fp.entidad,
  'Fuente sin carta pero NO tiene pendiente' as problema
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
LEFT JOIN documentos_pendientes dp ON dp.fuente_pago_id = fp.id AND dp.estado = 'Pendiente'
WHERE n.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND n.estado = 'Activa'
  AND fp.tipo != 'Cuota Inicial'
  AND fp.carta_aprobacion_url IS NULL
  AND dp.id IS NULL;
