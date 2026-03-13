-- ============================================================
-- FIX: Vista documentos_pendientes mal mostrando fuentes inactivas
-- ============================================================
--
-- Problema raíz: fuentes_pago tiene DOS columnas de estado:
--   - estado       TEXT  → 'Activa' | 'Inactiva'  (capitalizado)
--   - estado_fuente TEXT → 'activa' | 'inactiva' | 'reemplazada' (lowercase)
--
-- Al "Ajustar Plan" y quitar una fuente, el código solo actualizaba
-- estado_fuente = 'inactiva' pero NO estado = 'Inactiva'.
-- La vista filtraba solo por fp.estado = 'Activa', así que la fuente
-- inactiva seguía generando documentos pendientes.
--
-- Soluciones aplicadas:
--   1. (TypeScript) useNegociacionTab.ts: ahora también actualiza estado = 'Inactiva'
--   2. (SQL) Esta migración: añade filtro defensivo en la vista por estado_fuente
--   3. (SQL) Esta migración: corrige registros históricos inconsistentes en BD
--
-- Fecha: 2026-03-12
-- ============================================================

-- ─── PASO 1: Corregir registros históricos inconsistentes ───────────────────
-- Fuentes que tienen estado_fuente = 'inactiva' pero estado = 'Activa'
UPDATE fuentes_pago
SET estado = 'Inactiva'
WHERE estado_fuente IN ('inactiva', 'reemplazada')
  AND estado = 'Activa';

-- ─── PASO 2: Recrear la vista con filtro defensivo doble ────────────────────
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
  AND dc.estado = 'Activo'
WHERE rfc.activo = true
  AND rfc.alcance = 'COMPARTIDO_CLIENTE'
  AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
  AND dc.id IS NULL

ORDER BY prioridad DESC, tipo_documento;

COMMENT ON VIEW vista_documentos_pendientes_fuentes IS
'Vista de documentos pendientes con soporte para alcance:
- ESPECIFICO_FUENTE: Un pendiente por cada fuente activa (ej: Carta de Aprobación)
- COMPARTIDO_CLIENTE: Un solo pendiente, título "Requisitos para Desembolso" (ej: Boleta de Registro)
NOTA: Filtra por estado = Activa Y estado_fuente NOT IN (inactiva, reemplazada)
para cubrir tanto actualizaciones correctas como datos históricos inconsistentes.';

-- ─── PASO 3: Verificar resultado ────────────────────────────────────────────
-- Ver cuántos registros fueron corregidos
SELECT
  COUNT(*) FILTER (WHERE estado = 'Inactiva' AND estado_fuente IN ('inactiva', 'reemplazada')) AS ya_consistentes,
  COUNT(*) FILTER (WHERE estado = 'Activa'   AND estado_fuente IN ('inactiva', 'reemplazada')) AS inconsistentes_restantes,
  COUNT(*) FILTER (WHERE estado = 'Activa'   AND (estado_fuente IS NULL OR estado_fuente = 'activa')) AS activas_ok
FROM fuentes_pago;
