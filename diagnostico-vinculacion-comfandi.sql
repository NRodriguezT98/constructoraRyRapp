-- 🔍 DIAGNÓSTICO VINCULACIÓN CARTA COMFANDI
-- ✅ Nombres verificados en: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md

-- 1️⃣ VER DOCUMENTOS PENDIENTES ACTIVOS (con metadata)
-- ✅ Columnas verificadas en schema: id, fuente_pago_id, cliente_id, tipo_documento, categoria_id, metadata, estado
SELECT
  dp.id,
  dp.tipo_documento,
  dp.estado,
  dp.metadata,
  dp.cliente_id,
  dp.fuente_pago_id,
  dp.fecha_creacion,
  c.nombres || ' ' || c.apellidos as cliente_nombre
FROM documentos_pendientes dp
LEFT JOIN clientes c ON c.id = dp.cliente_id
WHERE dp.estado = 'Pendiente'
ORDER BY dp.fecha_creacion DESC
LIMIT 5;

-- 2️⃣ VER DOCUMENTOS DE CLIENTE RECIENTES (últimos subidos)
-- ✅ Columnas verificadas: id, titulo, nombre_archivo, url_storage, metadata, cliente_id, categoria_id, fecha_creacion
SELECT
  dc.id,
  dc.titulo,
  dc.nombre_archivo,
  dc.url_storage,
  dc.metadata,
  dc.cliente_id,
  dc.categoria_id,
  dc.fecha_creacion,
  c.nombres || ' ' || c.apellidos as cliente_nombre
FROM documentos_cliente dc
LEFT JOIN clientes c ON c.id = dc.cliente_id
WHERE dc.fecha_creacion > NOW() - INTERVAL '2 hours'
ORDER BY dc.fecha_creacion DESC
LIMIT 5;

-- 3️⃣ COMPARAR METADATA (pendiente vs subido)
-- Buscar carta aprobación Comfandi específicamente
SELECT
  'PENDIENTE' as origen,
  dp.id,
  dp.tipo_documento,
  dp.metadata->>'tipo_fuente' as tipo_fuente,
  dp.metadata->>'entidad' as entidad,
  dp.cliente_id,
  dp.fecha_creacion
FROM documentos_pendientes dp
WHERE dp.tipo_documento = 'Carta de Aprobación'
  AND dp.estado = 'Pendiente'
  AND dp.metadata->>'entidad' = 'Comfandi'

UNION ALL

SELECT
  'SUBIDO' as origen,
  dc.id,
  dc.titulo as tipo_documento,
  dc.metadata->>'tipo_fuente' as tipo_fuente,
  dc.metadata->>'entidad' as entidad,
  dc.cliente_id,
  dc.fecha_creacion
FROM documentos_cliente dc
WHERE dc.titulo ILIKE '%comfandi%'
  OR dc.metadata->>'entidad' = 'Comfandi'
ORDER BY fecha_creacion DESC;

-- 4️⃣ VERIFICAR TRIGGER EXECUTION
-- Ver si hubo intentos de vinculación automática
-- ✅ Columnas verificadas: fecha_evento, accion, tabla, registro_id, cambios_especificos, usuario_id
SELECT
  al.fecha_evento,
  al.accion,
  al.tabla,
  al.registro_id,
  al.cambios_especificos,
  al.usuario_id
FROM audit_log al
WHERE al.accion = 'VINCULACION_AUTOMATICA_DOCUMENTO'
  AND al.fecha_evento > NOW() - INTERVAL '2 hours'
ORDER BY al.fecha_evento DESC
LIMIT 5;

-- 5️⃣ VERIFICAR FUENTES DE PAGO (estado_documentacion)
-- ✅ Columnas verificadas: fuentes_pago NO tiene cliente_id directo, usar negociacion_id
SELECT
  fp.id,
  fp.entidad,
  fp.tipo,
  fp.estado_documentacion,
  fp.carta_aprobacion_url,
  fp.negociacion_id,
  fp.fecha_creacion,
  n.cliente_id,
  c.nombres || ' ' || c.apellidos as cliente_nombre
FROM fuentes_pago fp
LEFT JOIN negociaciones n ON n.id = fp.negociacion_id
LEFT JOIN clientes c ON c.id = n.cliente_id
WHERE fp.entidad = 'Comfandi'
ORDER BY fp.fecha_creacion DESC
LIMIT 3;
