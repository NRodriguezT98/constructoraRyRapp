-- VERSION ACTUAL
SELECT
  'VERSION_ACTUAL' as seccion,
  version_actual,
  version_lock
FROM negociaciones
WHERE id = '105f3121-8d56-4b29-adac-380cebdc1faf';

-- ULTIMAS 5 VERSIONES
SELECT
  'VERSION_' || version::text as num_version,
  tipo_cambio,
  LEFT(razon_cambio, 60) as razon
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
ORDER BY version DESC
LIMIT 5;

-- FUENTES ACTIVAS
SELECT
  'FUENTES' as tipo,
  COUNT(*) as activas
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND estado_fuente = 'activa';

-- TOTAL VERSIONES
SELECT
  'TOTAL' as tipo,
  COUNT(*) as versiones,
  MAX(version) as ultima
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf';
