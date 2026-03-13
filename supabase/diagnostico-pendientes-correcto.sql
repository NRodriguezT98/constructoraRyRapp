-- ============================================
-- DIAGNÓSTICO SIMPLE: Documentos Pendientes
-- ============================================
-- Usa nombres CORRECTOS del schema real
-- ============================================

-- 1. Ver documentos pendientes actuales
SELECT
  dp.id,
  dp.fuente_pago_id,
  dp.cliente_id,
  dp.tipo_documento,
  dp.estado,
  dp.metadata->>'tipo_fuente' AS metadata_tipo_fuente,
  dp.metadata->>'entidad' AS metadata_entidad,
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

-- 2. Ver últimos documentos de cartas de aprobación subidos
SELECT
  dc.id,
  dc.cliente_id,
  dc.titulo,
  dc.metadata->>'tipo_fuente' AS metadata_tipo_fuente,
  dc.metadata->>'entidad' AS metadata_entidad,
  dc.metadata->>'fuente_pago_id' AS metadata_fuente_id,
  dc.url_storage,
  dc.fecha_creacion,
  c.nombres || ' ' || c.apellidos AS cliente_nombre
FROM documentos_cliente dc
LEFT JOIN clientes c ON c.id = dc.cliente_id
WHERE dc.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34' -- ID de "Cartas de Aprobación"
ORDER BY dc.fecha_creacion DESC
LIMIT 10;

-- 3. Ver trigger activo
SELECT
  tgname AS trigger_nombre,
  tgrelid::regclass AS tabla,
  tgenabled AS estado,
  pg_get_triggerdef(oid) AS definicion
FROM pg_trigger
WHERE tgrelid = 'documentos_cliente'::regclass
  AND tgname LIKE '%vincular%';

-- 4. Comparar metadata de pendiente vs documento subido (para debug)
WITH ultimo_pendiente AS (
  SELECT
    dp.metadata->>'tipo_fuente' AS tipo_fuente,
    dp.metadata->>'entidad' AS entidad
  FROM documentos_pendientes dp
  WHERE dp.estado = 'Pendiente'
  ORDER BY dp.fecha_creacion DESC
  LIMIT 1
),
ultimo_documento AS (
  SELECT
    dc.metadata->>'tipo_fuente' AS tipo_fuente,
    dc.metadata->>'entidad' AS entidad
  FROM documentos_cliente dc
  WHERE dc.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34'
  ORDER BY dc.fecha_creacion DESC
  LIMIT 1
)
SELECT
  'Pendiente' AS origen,
  tipo_fuente,
  entidad
FROM ultimo_pendiente
UNION ALL
SELECT
  'Documento' AS origen,
  tipo_fuente,
  entidad
FROM ultimo_documento;
