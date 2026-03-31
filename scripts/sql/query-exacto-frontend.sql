-- 🔍 Query EXACTO que ejecuta el frontend
-- Para ver qué documentos pendientes está trayendo

SELECT
  dp.*,
  fp.tipo as fp_tipo,
  fp.entidad as fp_entidad,
  fp.estado as fp_estado,
  n.estado as negociacion_estado,
  CASE
    WHEN fp.id IS NULL THEN '❌ HUERFANO (fuente eliminada)'
    WHEN n.estado != 'Activa' THEN '⚠️ NEGOCIACION INACTIVA'
    ELSE '✅ VALIDO'
  END as diagnostico
FROM documentos_pendientes dp
LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
LEFT JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE dp.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND dp.estado = 'Pendiente'
ORDER BY dp.prioridad DESC, dp.fecha_creacion ASC;
