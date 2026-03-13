-- ============================================================
-- FIX: Vista documentos_pendientes — estado 'activo' lowercase
-- ============================================================
--
-- PROBLEMA: la vista filtraba dc.estado = 'Activo' (capitalizado)
-- pero documentos_cliente.estado se guarda como 'activo' (minúscula)
-- en DocumentosBaseService.subirDocumento → el LEFT JOIN nunca findaba
-- match → el doc aparecía siempre como pendiente incluso tras subirse.
--
-- FIX: cambiar ambas partes del UNION ALL a dc.estado = 'activo'
-- ============================================================

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
  AND dc.estado = 'activo'  -- ✅ FIX: minúscula, coincide con DocumentosBaseService.subirDocumento
  AND dc.cliente_id = n.cliente_id
WHERE fp.estado = 'Activa'
  -- ✅ FILTRO DEFENSIVO: también excluir si estado_fuente marca inactiva/reemplazada
  AND (fp.estado_fuente IS NULL OR fp.estado_fuente NOT IN ('inactiva', 'reemplazada'))
  AND dc.id IS NULL

UNION ALL

-- Documentos compartidos: uno por cliente
SELECT DISTINCT ON (clientes_con_fuentes.cliente_id, rfc.id)
  NULL::UUID as fuente_pago_id,
  clientes_con_fuentes.cliente_id,
  rfc.id as requisito_config_id,
  rfc.titulo as tipo_documento,
  rfc.tipo_documento_sugerido as tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.orden,
  rfc.descripcion,
  rfc.alcance,
  'Requisitos para Desembolso' as tipo_fuente,
  NULL as entidad,
  NULL::NUMERIC as monto_aprobado,
  jsonb_build_object(
    'tipo_fuente', 'Requisitos para Desembolso',
    'entidad_fuente', 'Documento habilitante',
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
  SELECT DISTINCT n.cliente_id
  FROM fuentes_pago fp
  JOIN negociaciones n ON n.id = fp.negociacion_id
  WHERE fp.estado = 'Activa'
    -- ✅ FILTRO DEFENSIVO también en compartidos
    AND (fp.estado_fuente IS NULL OR fp.estado_fuente NOT IN ('inactiva', 'reemplazada'))
) clientes_con_fuentes
CROSS JOIN requisitos_fuentes_pago_config rfc
LEFT JOIN documentos_cliente dc
  ON dc.cliente_id = clientes_con_fuentes.cliente_id
  AND (dc.tipo_documento = rfc.tipo_documento_sugerido OR dc.tipo_documento = rfc.titulo)
  AND dc.estado = 'activo'  -- ✅ FIX: minúscula, coincide con DocumentosBaseService.subirDocumento
WHERE rfc.activo = true
  AND rfc.alcance = 'COMPARTIDO_CLIENTE'
  AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
  AND dc.id IS NULL

ORDER BY prioridad DESC, tipo_documento;

COMMENT ON VIEW vista_documentos_pendientes_fuentes IS
'Vista de documentos pendientes con soporte para alcance:
- ESPECIFICO_FUENTE: Un pendiente por cada fuente activa (ej: Carta de Aprobación)
- COMPARTIDO_CLIENTE: Un solo pendiente, título "Requisitos para Desembolso" (ej: Boleta de Registro)
Estado: usa ''activo'' minúscula para coincidir con DocumentosBaseService.subirDocumento.
Filtra por estado = Activa Y estado_fuente NOT IN (inactiva, reemplazada).';
