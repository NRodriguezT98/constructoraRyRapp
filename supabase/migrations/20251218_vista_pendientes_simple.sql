-- ============================================
-- VISTA: Documentos Pendientes en Tiempo Real
-- ============================================

-- 1. Eliminar vista si existe
DROP VIEW IF EXISTS vista_documentos_pendientes_fuentes CASCADE;

-- 2. Crear vista
CREATE OR REPLACE VIEW vista_documentos_pendientes_fuentes AS
SELECT
  fp.id as fuente_pago_id,
  n.cliente_id,
  rfc.id as requisito_config_id,
  rfc.titulo as tipo_documento,
  rfc.tipo_documento_sugerido as tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.orden,
  rfc.descripcion,
  fp.tipo as tipo_fuente,
  fp.entidad,
  fp.monto_aprobado,
  jsonb_build_object(
    'tipo_fuente', fp.tipo,
    'entidad', COALESCE(fp.entidad, ''),
    'monto_aprobado', fp.monto_aprobado,
    'nivel_validacion', rfc.nivel_validacion,
    'tipo_documento_sistema', COALESCE(rfc.tipo_documento_sugerido, rfc.titulo),
    'requisito_config_id', rfc.id
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
  AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
LEFT JOIN documentos_cliente dc
  ON dc.fuente_pago_relacionada = fp.id
  AND (dc.tipo_documento = rfc.tipo_documento_sugerido OR dc.tipo_documento = rfc.titulo)
  AND dc.estado = 'Activo'
  AND dc.cliente_id = n.cliente_id
WHERE fp.estado = 'Activa'
  AND dc.id IS NULL;

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_documentos_cliente_fuente_tipo
ON documentos_cliente(fuente_pago_relacionada, tipo_documento, estado)
WHERE estado = 'Activo';

CREATE INDEX IF NOT EXISTS idx_requisitos_fuentes_tipo_activo
ON requisitos_fuentes_pago_config(tipo_fuente, activo)
WHERE activo = true;

-- 4. Verificar
SELECT
  c.nombres || ' ' || c.apellidos as cliente,
  v.tipo_fuente,
  v.entidad,
  v.tipo_documento,
  v.nivel_validacion,
  v.prioridad
FROM vista_documentos_pendientes_fuentes v
JOIN clientes c ON c.id = v.cliente_id
ORDER BY c.apellidos, v.tipo_fuente, v.nivel_validacion;
