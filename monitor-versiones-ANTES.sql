-- ============================================
-- SCRIPT DE MONITOREO: Versiones de Negociación
-- ============================================
-- Antes de hacer cambios, ejecutar esto para ver estado inicial

SELECT
    '=== ESTADO ACTUAL ===' as seccion;

-- 1. Versión actual de la negociación
SELECT
    'VERSION_ACTUAL' as tipo,
    id,
    version_actual,
    version_lock,
    fecha_ultima_modificacion
FROM negociaciones
WHERE id = '105f3121-8d56-4b29-adac-380cebdc1faf';

-- 2. Últimas 5 versiones en historial
SELECT
    'ULTIMAS_VERSIONES' as tipo,
    version,
    tipo_cambio,
    LEFT(razon_cambio, 60) as razon,
    fecha_cambio,
    usuario_id
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
ORDER BY version DESC
LIMIT 5;

-- 3. Fuentes activas actuales
SELECT
    'FUENTES_ACTIVAS' as tipo_seccion,
    tipo,
    monto_aprobado,
    estado_fuente
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND estado_fuente = 'activa'
ORDER BY tipo;

-- 4. Total de versiones
SELECT
    'TOTAL_VERSIONES' as tipo,
    COUNT(*) as total_versiones,
    MAX(version) as version_maxima
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf';
