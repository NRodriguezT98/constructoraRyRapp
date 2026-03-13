-- ============================================
-- DIAGNÓSTICO: Sistema de Documentos Pendientes
-- ============================================
-- Verifica el estado del sistema de vinculación automática
-- ============================================

-- 1. Ver función actual de vinculación
SELECT
  proname as funcion,
  pg_get_functiondef(oid) as definicion
FROM pg_proc
WHERE proname IN ('vincular_documento_pendiente_automatico', 'vincular_documento_subido_a_fuente_pendiente')
ORDER BY proname;

-- 2. Ver triggers activos en documentos_cliente
SELECT
  tgname AS trigger_nombre,
  tgrelid::regclass AS tabla,
  tgenabled AS estado,
  pg_get_triggerdef(oid) AS definicion
FROM pg_trigger
WHERE tgrelid = 'documentos_cliente'::regclass
  AND tgname LIKE '%vincular%';

-- 3. Ver documentos pendientes actuales
SELECT
  dp.id,
  dp.fuente_pago_id,
  dp.cliente_id,
  dp.tipo_documento,
  dp.estado,
  dp.metadata,
  fp.tipo AS fuente_tipo,
  fp.entidad AS fuente_entidad,
  fp.estado_documentacion,
  c.nombres || ' ' || c.apellidos AS cliente_nombre
FROM documentos_pendientes dp
JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
JOIN clientes c ON c.id = dp.cliente_id
WHERE dp.estado = 'Pendiente'
ORDER BY dp.fecha_creacion DESC
LIMIT 10;

-- 4. Ver últimos documentos de tipo "Carta de Aprobación" subidos
SELECT
  dc.id,
  dc.cliente_id,
  dc.titulo,
  dc.categoria_id,
  dc.metadata,
  dc.url,
  dc.fecha_subida,
  c.nombres || ' ' || c.apellidos AS cliente_nombre
FROM documentos_cliente dc
LEFT JOIN clientes c ON c.id = dc.cliente_id
WHERE dc.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34' -- ID de "Cartas de Aprobación"
ORDER BY dc.fecha_subida DESC
LIMIT 10;

-- 5. Ver fuentes sin carta (que deberían tener pendientes)
SELECT
  fp.id AS fuente_id,
  fp.tipo AS fuente_tipo,
  fp.entidad,
  fp.estado_documentacion,
  fp.carta_aprobacion_url,
  c.nombres || ' ' || c.apellidos AS cliente_nombre,
  EXISTS(
    SELECT 1
    FROM documentos_pendientes dp
    WHERE dp.fuente_pago_id = fp.id AND dp.estado = 'Pendiente'
  ) AS tiene_pendiente
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN clientes c ON c.id = n.cliente_id
WHERE fp.carta_aprobacion_url IS NULL
  AND fp.tipo != 'Cuota Inicial'
ORDER BY fp.fecha_creacion DESC
LIMIT 10;
