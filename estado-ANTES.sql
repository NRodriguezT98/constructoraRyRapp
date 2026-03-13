-- Estado ANTES de modificar fuentes

-- Versión actual
SELECT 'VERSION_ACTUAL' as seccion, version_actual, version_lock
FROM negociaciones
WHERE id = '105f3121-8d56-4b29-adac-380cebdc1faf';

-- Últimas 5 versiones
SELECT 'ULTIMAS_5_VERSIONES' as seccion, version, tipo_cambio, LEFT(razon_cambio, 40) as razon
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
ORDER BY version DESC
LIMIT 5;

-- Fuentes activas
SELECT 'FUENTES_ACTIVAS' as seccion, COUNT(*) as cantidad
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND estado_fuente = 'activa';

-- Total versiones
SELECT 'TOTAL_VERSIONES' as seccion, COUNT(*) as total, MAX(version) as max_version
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf';
