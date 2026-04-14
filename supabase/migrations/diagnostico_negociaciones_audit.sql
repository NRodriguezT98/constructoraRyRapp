-- ============================================================
-- DIAGNÓSTICO: ¿Qué hay en audit_log para negociaciones?
-- ============================================================

-- 1. Total de entradas de negociaciones en audit_log
SELECT
  'Total registros negociaciones en audit_log' AS descripcion,
  COUNT(*) AS cantidad
FROM audit_log
WHERE tabla = 'negociaciones';

-- 2. ¿Cuántos tienen cliente_id en metadata?
SELECT
  'Registros con cliente_id en metadata' AS descripcion,
  COUNT(*) AS cantidad
FROM audit_log
WHERE tabla = 'negociaciones'
  AND metadata->>'cliente_id' IS NOT NULL;

-- 3. ¿Cuántos tienen metadata vacío?
SELECT
  'Registros con metadata vacío o nulo' AS descripcion,
  COUNT(*) AS cantidad
FROM audit_log
WHERE tabla = 'negociaciones'
  AND (metadata IS NULL OR metadata = '{}'::jsonb OR metadata->>'cliente_id' IS NULL);

-- 4. Últimos 10 registros de negociaciones (con o sin cliente_id)
SELECT
  id,
  accion,
  fecha_evento,
  usuario_email,
  metadata->>'cliente_id'         AS cliente_id_en_metadata,
  datos_nuevos->>'cliente_id'     AS cliente_id_en_datos_nuevos,
  datos_nuevos->>'descuento_aplicado' AS descuento_en_datos_nuevos,
  cambios_especificos->>'descuento_aplicado' AS cambio_descuento,
  metadata
FROM audit_log
WHERE tabla = 'negociaciones'
ORDER BY fecha_evento DESC
LIMIT 10;

-- 5. ¿Existen registros con descuento_aplicado en los datos?
SELECT
  id,
  fecha_evento,
  usuario_email,
  metadata->>'cliente_id'              AS cliente_id,
  datos_nuevos->>'descuento_aplicado'   AS descuento_nuevo,
  datos_anteriores->>'descuento_aplicado' AS descuento_anterior,
  metadata
FROM audit_log
WHERE tabla = 'negociaciones'
  AND (
    datos_nuevos->>'descuento_aplicado' IS NOT NULL
    OR cambios_especificos ? 'descuento_aplicado'
  )
ORDER BY fecha_evento DESC
LIMIT 10;

-- 6. Verificar que el nuevo trigger existe
SELECT
  tgname AS trigger_name,
  proname AS function_name,
  tgenabled AS enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'negociaciones'::regclass
  AND tgname = 'negociaciones_audit_trigger';
