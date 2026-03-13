-- ============================================
-- DIAGNÓSTICO SIMPLIFICADO: Documentos Pendientes
-- ============================================

-- 1. Ver documentos pendientes actuales
SELECT
  'DOCUMENTOS PENDIENTES' AS seccion,
  dp.id,
  dp.fuente_pago_id,
  dp.cliente_id,
  dp.tipo_documento,
  dp.estado,
  dp.metadata
FROM documentos_pendientes dp
WHERE dp.estado = 'Pendiente'
ORDER BY dp.fecha_creacion DESC
LIMIT 10;

-- 2. Ver fuentes de pago sin carta
SELECT
  'FUENTES SIN CARTA' AS seccion,
  fp.id,
  fp.tipo,
  fp.entidad,
  fp.estado_documentacion,
  fp.carta_aprobacion_url,
  n.cliente_id
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE fp.carta_aprobacion_url IS NULL
  AND fp.tipo != 'Cuota Inicial'
ORDER BY fp.fecha_creacion DESC
LIMIT 10;

-- 3. Ver último documento subido con categoría Cartas de Aprobación
SELECT
  'ULTIMO DOCUMENTO SUBIDO' AS seccion,
  dc.id,
  dc.cliente_id,
  dc.titulo,
  dc.categoria_id,
  dc.metadata,
  dc.fecha_subida
FROM documentos_cliente dc
WHERE dc.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34'
ORDER BY dc.fecha_subida DESC
LIMIT 1;

-- 4. Ver función de vinculación actual
SELECT
  'FUNCION DE VINCULACION' AS seccion,
  proname,
  prosrc
FROM pg_proc
WHERE proname IN ('vincular_documento_pendiente_automatico', 'vincular_documento_subido_a_fuente_pendiente')
LIMIT 1;
