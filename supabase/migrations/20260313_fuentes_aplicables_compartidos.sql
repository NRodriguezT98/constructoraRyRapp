-- ============================================================
-- MIGRACIÓN: fuentes_aplicables para requisitos COMPARTIDO_CLIENTE
-- ============================================================
--
-- Motivación: Permite que un requisito compartido (alcance = COMPARTIDO_CLIENTE)
-- aplique solo a un subconjunto de fuentes de pago en lugar de a todas.
--
-- Ejemplo: "Boleta de Registro" puede requerirse para
--   ['Crédito Hipotecario', 'Subsidio Mi Casa Ya'] pero NO para 'Cuota Inicial'.
--
-- Diseño:
--   fuentes_aplicables IS NULL  → aplica a TODAS las fuentes (comportamiento previo)
--   fuentes_aplicables = '{...}' → aplica solo a esas fuentes
--
-- Fecha: 2026-03-13
-- ============================================================

-- ─── PASO 1: Agregar columna ──────────────────────────────────────────────────
ALTER TABLE requisitos_fuentes_pago_config
  ADD COLUMN IF NOT EXISTS fuentes_aplicables TEXT[];

COMMENT ON COLUMN requisitos_fuentes_pago_config.fuentes_aplicables IS
  'Solo para alcance=COMPARTIDO_CLIENTE. NULL = aplica a todas las fuentes activas del cliente. Array = aplica solo a esas fuentes.';

-- ─── PASO 2: Recrear la vista incluyendo filtro por fuentes_aplicables ────────
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
  AND (fp.estado_fuente IS NULL OR fp.estado_fuente NOT IN ('inactiva', 'reemplazada'))
  AND dc.id IS NULL

UNION ALL

-- Documentos compartidos: uno por cliente (con filtro opcional de fuentes)
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
  SELECT DISTINCT n.cliente_id, fp.tipo as tipo_fuente_activa
  FROM fuentes_pago fp
  JOIN negociaciones n ON n.id = fp.negociacion_id
  WHERE fp.estado = 'Activa'
    AND (fp.estado_fuente IS NULL OR fp.estado_fuente NOT IN ('inactiva', 'reemplazada'))
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
  -- ✅ Si fuentes_aplicables tiene valor, filtrar solo los clientes que tienen alguna
  --    de esas fuentes activas. Si es NULL, aplica a todos.
  AND (
    rfc.fuentes_aplicables IS NULL
    OR clientes_con_fuentes.tipo_fuente_activa = ANY(rfc.fuentes_aplicables)
  )

ORDER BY prioridad DESC, tipo_documento;

COMMENT ON VIEW vista_documentos_pendientes_fuentes IS
'Vista de documentos pendientes con soporte para alcance:
- ESPECIFICO_FUENTE: Un pendiente por cada fuente activa (ej: Carta de Aprobación)
- COMPARTIDO_CLIENTE: Un solo pendiente por cliente (ej: Boleta de Registro)
  → fuentes_aplicables IS NULL → aplica a todos
  → fuentes_aplicables = [...] → aplica solo si el cliente tiene alguna de esas fuentes
Filtro: estado = Activa Y estado_fuente NOT IN (inactiva, reemplazada).';

-- ─── PASO 3: Verificación ────────────────────────────────────────────────────
SELECT id, titulo, alcance, tipo_fuente, fuentes_aplicables
FROM requisitos_fuentes_pago_config
WHERE alcance = 'COMPARTIDO_CLIENTE' AND activo = true
ORDER BY orden;
