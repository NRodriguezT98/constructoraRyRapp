-- =====================================================
-- FIX: Corregir case en estado de documentos_cliente en la vista
-- Problema: 20260313_fix_compartidos_fuentes_aplicables.sql recreó la vista
--           con dc.estado = 'Activo' (capital A), revirtiendo el fix del
--           20260312_fix_vista_estado_activo_case.sql.
-- El servicio DocumentosBaseService.subirDocumento guarda estado = 'activo'
-- (minúscula), por lo que la vista nunca encuentra el documento subido
-- y el pendiente nunca desaparece.
-- Fix: restaurar dc.estado = 'activo' en ambos branches del UNION ALL.
-- =====================================================

DROP VIEW IF EXISTS vista_documentos_pendientes_fuentes CASCADE;

CREATE OR REPLACE VIEW vista_documentos_pendientes_fuentes AS

-- ==============================================================
-- Branch 1: Documentos ESPECÍFICOS — uno por fuente
-- ==============================================================
SELECT
  fp.id                               AS fuente_pago_id,
  n.cliente_id,
  rfc.id                              AS requisito_config_id,
  rfc.titulo                          AS tipo_documento,
  rfc.tipo_documento_sugerido         AS tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.orden,
  rfc.descripcion,
  rfc.alcance,
  fp.tipo                             AS tipo_fuente,
  fp.entidad,
  fp.monto_aprobado,
  rfc.fuentes_aplicables,
  jsonb_build_object(
    'tipo_fuente',          fp.tipo,
    'entidad_fuente',       COALESCE(fp.entidad, ''),
    'monto_aprobado',       fp.monto_aprobado,
    'nivel_validacion',     rfc.nivel_validacion,
    'tipo_documento_sistema', COALESCE(rfc.tipo_documento_sugerido, rfc.titulo),
    'requisito_config_id',  rfc.id,
    'alcance',              rfc.alcance
  )                                   AS metadata,
  'Pendiente'                         AS estado,
  CASE
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OPCIONAL'    THEN 'Media'
    ELSE 'Baja'
  END                                 AS prioridad,
  fp.fecha_creacion,
  NOW()                               AS fecha_calculo

FROM fuentes_pago fp
JOIN negociaciones n
  ON n.id = fp.negociacion_id
JOIN requisitos_fuentes_pago_config rfc
  ON  rfc.tipo_fuente       = fp.tipo
  AND rfc.activo            = true
  AND rfc.alcance           = 'ESPECIFICO_FUENTE'
  AND rfc.nivel_validacion  IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
LEFT JOIN documentos_cliente dc
  ON  dc.fuente_pago_relacionada = fp.id
  AND (dc.tipo_documento = rfc.tipo_documento_sugerido OR dc.tipo_documento = rfc.titulo)
  AND dc.estado      = 'activo'   -- ✅ minúscula: coincide con DocumentosBaseService
  AND dc.cliente_id  = n.cliente_id
WHERE fp.estado = 'Activa'
  AND dc.id IS NULL

UNION ALL

-- ==============================================================
-- Branch 2: Documentos COMPARTIDOS — uno por cliente
-- ==============================================================
SELECT DISTINCT ON (clientes_con_fuentes.cliente_id, rfc.id)
  NULL::UUID                          AS fuente_pago_id,
  clientes_con_fuentes.cliente_id,
  rfc.id                              AS requisito_config_id,
  rfc.titulo                          AS tipo_documento,
  rfc.tipo_documento_sugerido         AS tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.orden,
  rfc.descripcion,
  rfc.alcance,
  'Compartido'                        AS tipo_fuente,
  'General'                           AS entidad,
  NULL::NUMERIC                       AS monto_aprobado,
  rfc.fuentes_aplicables,
  jsonb_build_object(
    'tipo_fuente',          'Compartido',
    'entidad_fuente',       'General',
    'monto_aprobado',       NULL,
    'nivel_validacion',     rfc.nivel_validacion,
    'tipo_documento_sistema', COALESCE(rfc.tipo_documento_sugerido, rfc.titulo),
    'requisito_config_id',  rfc.id,
    'alcance',              rfc.alcance,
    'fuentes_aplicables',   rfc.fuentes_aplicables
  )                                   AS metadata,
  'Pendiente'                         AS estado,
  CASE
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OPCIONAL'    THEN 'Media'
    ELSE 'Baja'
  END                                 AS prioridad,
  NOW()                               AS fecha_creacion,
  NOW()                               AS fecha_calculo

FROM (
  SELECT DISTINCT n.cliente_id
  FROM fuentes_pago fp
  JOIN negociaciones n ON n.id = fp.negociacion_id
  WHERE fp.estado = 'Activa'
) clientes_con_fuentes

JOIN requisitos_fuentes_pago_config rfc
  ON (
    rfc.fuentes_aplicables IS NULL
    OR rfc.fuentes_aplicables = '{}'
    OR EXISTS (
      SELECT 1
      FROM fuentes_pago fp2
      JOIN negociaciones n2 ON n2.id = fp2.negociacion_id
      WHERE n2.cliente_id = clientes_con_fuentes.cliente_id
        AND fp2.estado    = 'Activa'
        AND fp2.tipo      = ANY(rfc.fuentes_aplicables)
    )
  )

LEFT JOIN documentos_cliente dc
  ON  dc.cliente_id       = clientes_con_fuentes.cliente_id
  AND (dc.tipo_documento  = rfc.tipo_documento_sugerido OR dc.tipo_documento = rfc.titulo)
  AND dc.estado           = 'activo'   -- ✅ minúscula: coincide con DocumentosBaseService

WHERE rfc.activo           = true
  AND rfc.alcance          = 'COMPARTIDO_CLIENTE'
  AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
  AND dc.id IS NULL

ORDER BY prioridad DESC, tipo_documento;
