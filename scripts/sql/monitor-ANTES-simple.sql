-- ============================================
-- MONITOR ESTADO INICIAL
-- ============================================

\echo '\n========================================================================'
\echo '📊 ESTADO INICIAL (ANTES DE MODIFICAR FUENTES)'
\echo '========================================================================\n'

\echo '1️⃣  VERSIÓN ACTUAL:'
SELECT
  version_actual,
  version_lock,
  TO_CHAR(fecha_ultima_modificacion, 'YYYY-MM-DD HH24:MI:SS') as ultima_modificacion
FROM negociaciones
WHERE id = '105f3121-8d56-4b29-adac-380cebdc1faf';

\echo '\n2️⃣  ÚLTIMAS 5 VERSIONES:'
SELECT
  version,
  tipo_cambio,
  LEFT(razon_cambio, 50) as razon,
  TO_CHAR(fecha_cambio, 'HH24:MI:SS') as hora
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
ORDER BY version DESC
LIMIT 5;

\echo '\n3️⃣  FUENTES ACTIVAS:'
SELECT
  tipo,
  monto_aprobado
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND estado_fuente = 'activa'
ORDER BY tipo;

\echo '\n4️⃣  TOTAL VERSIONES HISTORIAL:'
SELECT
  COUNT(*) as total_versiones,
  MAX(version) as version_maxima
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf';

\echo '\n========================================================================'
\echo '✅ Estado inicial capturado'
\echo '⏳ Ahora MODIFICA las fuentes de pago en la UI...'
\echo '   (Ejemplo: Elimina una fuente O modifica el monto de otra)'
\echo '   Luego ejecuta: npm run db:exec monitor-DESPUES-simple.sql'
\echo '========================================================================\n'
