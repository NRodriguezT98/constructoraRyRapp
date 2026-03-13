-- ============================================
-- VERIFICACIÓN Y LIMPIEZA: Documentos Pendientes
-- ============================================
-- Verifica estado actual y limpia pendientes obsoletos
-- ============================================

-- 1. Ver pendientes actuales agrupados por fuente y tipo
SELECT
  c.nombres || ' ' || c.apellidos as cliente,
  fp.tipo as fuente_tipo,
  fp.entidad,
  dp.tipo_documento,
  dp.prioridad,
  dp.metadata->>'nivel_validacion' as nivel,
  dp.estado,
  COUNT(*) OVER (PARTITION BY fp.id) as total_pendientes_fuente
FROM documentos_pendientes dp
JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
JOIN clientes c ON c.id = dp.cliente_id
WHERE dp.estado = 'Pendiente'
ORDER BY c.apellidos, fp.tipo, dp.prioridad DESC;

-- 2. Detectar pendientes que ya tienen documento subido (para limpiar)
SELECT
  c.nombres || ' ' || c.apellidos as cliente,
  dp.tipo_documento as pendiente,
  dc.tipo_documento as documento_subido,
  dp.estado as estado_pendiente,
  dc.estado as estado_documento,
  'Pendiente obsoleto - ya existe documento' as accion_sugerida
FROM documentos_pendientes dp
JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
JOIN clientes c ON c.id = dp.cliente_id
JOIN documentos_cliente dc ON dc.fuente_pago_relacionada = fp.id
  AND dc.cliente_id = c.id
  AND dc.estado = 'Activo'
WHERE dp.estado = 'Pendiente'
  AND (
    dc.tipo_documento = (dp.metadata->>'tipo_documento_sistema')
    OR dc.tipo_documento ILIKE '%' || dp.tipo_documento || '%'
  );

-- 3. Limpiar pendientes obsoletos (marcar como completados)
UPDATE documentos_pendientes dp
SET
  estado = 'Completado',
  fecha_completado = NOW(),
  completado_por = NULL -- Sistema
FROM documentos_cliente dc
WHERE dc.fuente_pago_relacionada = dp.fuente_pago_id
  AND dc.cliente_id = dp.cliente_id
  AND dc.estado = 'Activo'
  AND dp.estado = 'Pendiente'
  AND (
    dc.tipo_documento = (dp.metadata->>'tipo_documento_sistema')
    OR dc.tipo_documento ILIKE '%' || dp.tipo_documento || '%'
  );

-- 4. Ver resumen por cliente
SELECT
  c.nombres || ' ' || c.apellidos as cliente,
  COUNT(*) FILTER (WHERE dp.estado = 'Pendiente') as pendientes,
  COUNT(*) FILTER (WHERE dp.estado = 'Completado') as completados,
  COUNT(DISTINCT fp.id) as fuentes_con_pendientes
FROM clientes c
LEFT JOIN documentos_pendientes dp ON dp.cliente_id = c.id
LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id AND fp.estado = 'Activa'
GROUP BY c.id, c.nombres, c.apellidos
HAVING COUNT(*) FILTER (WHERE dp.estado = 'Pendiente') > 0
ORDER BY pendientes DESC;

-- 5. Ver distribución por nivel de validación
SELECT
  dp.metadata->>'nivel_validacion' as nivel,
  COUNT(*) as cantidad,
  COUNT(*) FILTER (WHERE dp.prioridad = 'Alta') as alta_prioridad,
  COUNT(*) FILTER (WHERE dp.prioridad = 'Media') as media_prioridad
FROM documentos_pendientes dp
WHERE dp.estado = 'Pendiente'
GROUP BY dp.metadata->>'nivel_validacion';
