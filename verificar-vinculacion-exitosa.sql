-- ✅ VERIFICAR VINCULACIÓN EXITOSA

-- 1️⃣ Ver documento pendiente (debe estar Completado)
SELECT
  '1. PENDIENTE' as seccion,
  id,
  tipo_documento,
  estado,
  fecha_creacion,
  fecha_completado
FROM documentos_pendientes
WHERE id = 'a87dedc0-dc9f-4dec-8c92-0094227de63e';

-- 2️⃣ Ver fuente de pago (debe tener carta_aprobacion_url)
SELECT
  '2. FUENTE_PAGO' as seccion,
  id,
  entidad,
  tipo,
  estado_documentacion,
  carta_aprobacion_url,
  fecha_actualizacion
FROM fuentes_pago
WHERE id = '65dc5c6d-e1b7-4e14-803c-8b5cff8c3cfb';

-- 3️⃣ Ver auditoría de la vinculación
SELECT
  '3. AUDITORIA' as seccion,
  fecha_evento,
  accion,
  metadata->>'razon' as razon,
  metadata->>'entidad' as entidad
FROM audit_log
WHERE registro_id = '65dc5c6d-e1b7-4e14-803c-8b5cff8c3cfb'
  AND accion = 'UPDATE'
  AND fecha_evento > NOW() - INTERVAL '5 minutes'
ORDER BY fecha_evento DESC
LIMIT 1;
