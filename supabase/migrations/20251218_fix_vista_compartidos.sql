-- ============================================
-- FIX: Vista con documentos compartidos únicos
-- ============================================

DROP VIEW IF EXISTS vista_documentos_pendientes_fuentes CASCADE;

CREATE OR REPLACE VIEW vista_documentos_pendientes_fuentes AS
-- Documentos específicos: uno por fuente
SELECT
  fp.id as fuente_pago_id,
  n.cliente_id,
  rfc.id as requisito_config_id,
  rfc.titulo as tipo_documento,
  rfc.tipo_documento_sugerido as tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.orden,
  rfc.descripcion,
  rfc.alcance,
  fp.tipo as tipo_fuente,
  fp.entidad,
  fp.monto_aprobado,
  jsonb_build_object(
    'tipo_fuente', fp.tipo,
    'entidad_fuente', COALESCE(fp.entidad, ''),
    'monto_aprobado', fp.monto_aprobado,
    'nivel_validacion', rfc.nivel_validacion,
    'tipo_documento_sistema', COALESCE(rfc.tipo_documento_sugerido, rfc.titulo),
    'requisito_config_id', rfc.id,
    'alcance', rfc.alcance
  ) as metadata,
  'Pendiente' as estado,
  CASE
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OPCIONAL' THEN 'Media'
    ELSE 'Baja'
  END as prioridad,
  fp.fecha_creacion,
  NOW() as fecha_calculo
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN requisitos_fuentes_pago_config rfc
  ON rfc.tipo_fuente = fp.tipo
  AND rfc.activo = true
  AND rfc.alcance = 'ESPECIFICO_FUENTE'
  AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
LEFT JOIN documentos_cliente dc
  ON dc.fuente_pago_relacionada = fp.id
  AND (dc.tipo_documento = rfc.tipo_documento_sugerido OR dc.tipo_documento = rfc.titulo)
  AND dc.estado = 'Activo'
  AND dc.cliente_id = n.cliente_id
WHERE fp.estado = 'Activa'
  AND dc.id IS NULL

UNION ALL

-- Documentos compartidos: uno por cliente (sin duplicar)
SELECT DISTINCT ON (clientes_con_fuentes.cliente_id, rfc.id)
  NULL::UUID as fuente_pago_id,  -- NULL porque es compartido
  clientes_con_fuentes.cliente_id,
  rfc.id as requisito_config_id,
  rfc.titulo as tipo_documento,
  rfc.tipo_documento_sugerido as tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.orden,
  rfc.descripcion,
  rfc.alcance,
  'Compartido' as tipo_fuente,
  'General' as entidad,
  NULL::NUMERIC as monto_aprobado,
  jsonb_build_object(
    'tipo_fuente', 'Compartido',
    'entidad_fuente', 'General',
    'monto_aprobado', NULL,
    'nivel_validacion', rfc.nivel_validacion,
    'tipo_documento_sistema', COALESCE(rfc.tipo_documento_sugerido, rfc.titulo),
    'requisito_config_id', rfc.id,
    'alcance', rfc.alcance
  ) as metadata,
  'Pendiente' as estado,
  CASE
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OPCIONAL' THEN 'Media'
    ELSE 'Baja'
  END as prioridad,
  NOW() as fecha_creacion,
  NOW() as fecha_calculo
FROM (
  -- Clientes que tienen al menos una fuente activa
  SELECT DISTINCT n.cliente_id
  FROM fuentes_pago fp
  JOIN negociaciones n ON n.id = fp.negociacion_id
  WHERE fp.estado = 'Activa'
) clientes_con_fuentes
CROSS JOIN requisitos_fuentes_pago_config rfc
LEFT JOIN documentos_cliente dc
  ON dc.cliente_id = clientes_con_fuentes.cliente_id
  AND (dc.tipo_documento = rfc.tipo_documento_sugerido OR dc.tipo_documento = rfc.titulo)
  AND dc.estado = 'Activo'
WHERE rfc.activo = true
  AND rfc.alcance = 'COMPARTIDO_CLIENTE'
  AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
  AND dc.id IS NULL

ORDER BY prioridad DESC, tipo_documento;

-- Verificar resultado
SELECT
  'PENDIENTES PEDRITO' as test,
  tipo_documento,
  alcance,
  tipo_fuente,
  entidad,
  COUNT(*) OVER (PARTITION BY tipo_documento) as veces_aparece
FROM vista_documentos_pendientes_fuentes
WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY alcance DESC, tipo_fuente, tipo_documento;
