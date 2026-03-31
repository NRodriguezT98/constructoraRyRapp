-- ============================================
-- MONITOR ESTADO DESPUÉS DEL CAMBIO
-- ============================================

\echo '\n========================================================================'
\echo '🔍 ANÁLISIS DESPUÉS DE MODIFICAR FUENTES'
\echo '========================================================================\n'

\echo '1️⃣  NUEVA VERSIÓN:'
SELECT
  version_actual,
  version_lock,
  TO_CHAR(fecha_ultima_modificacion, 'YYYY-MM-DD HH24:MI:SS') as ultima_mod
FROM negociaciones
WHERE id = '105f3121-8d56-4b29-adac-380cebdc1faf';

\echo '\n2️⃣  ⚠️  VERSIONES CREADAS EN EL ÚLTIMO MINUTO:'
SELECT
  version,
  tipo_cambio,
  LEFT(razon_cambio, 50) as razon,
  TO_CHAR(fecha_cambio, 'HH24:MI:SS.MS') as timestamp_exacto,
  ROUND(EXTRACT(EPOCH FROM (NOW() - fecha_cambio))) as segundos_atras
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND fecha_cambio > NOW() - INTERVAL '1 minute'
ORDER BY version DESC;

\echo '\n3️⃣  DUPLICADOS (versiones en el mismo segundo):'
SELECT
  TO_CHAR(DATE_TRUNC('second', fecha_cambio), 'HH24:MI:SS') as mismo_segundo,
  COUNT(*) as cantidad_versiones,
  STRING_AGG(version::text, ', ') as versiones_afectadas
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND fecha_cambio > NOW() - INTERVAL '1 minute'
GROUP BY DATE_TRUNC('second', fecha_cambio)
HAVING COUNT(*) > 1;

\echo '\n4️⃣  FUENTES ACTIVAS AHORA:'
SELECT
  tipo,
  monto_aprobado
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND estado_fuente = 'activa'
ORDER BY tipo;

\echo '\n5️⃣  FUENTES INACTIVADAS RECIENTEMENTE:'
SELECT
  tipo,
  monto_aprobado,
  TO_CHAR(fecha_inactivacion, 'HH24:MI:SS') as hora_inactivacion,
  LEFT(razon_inactivacion, 40) as razon
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND estado_fuente = 'inactiva'
  AND fecha_inactivacion > NOW() - INTERVAL '1 minute';

\echo '\n6️⃣  RESUMEN:'
SELECT
  (SELECT COUNT(*) FROM negociaciones_historial
   WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
     AND fecha_cambio > NOW() - INTERVAL '1 minute') as versiones_creadas,
  (SELECT COUNT(*) FROM fuentes_pago
   WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
     AND estado_fuente = 'activa') as fuentes_activas,
  (SELECT COUNT(*) FROM fuentes_pago
   WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
     AND estado_fuente = 'inactiva'
     AND fecha_inactivacion > NOW() - INTERVAL '1 minute') as fuentes_eliminadas;

\echo '\n========================================================================'
\echo '📊 DIAGNÓSTICO:'
\echo ''
\echo '   Si versiones_creadas > 1 → HAY TRIGGERS DUPLICADOS'
\echo '   Si versiones_creadas = 1 → Sistema funcionando correctamente'
\echo '========================================================================\n'
