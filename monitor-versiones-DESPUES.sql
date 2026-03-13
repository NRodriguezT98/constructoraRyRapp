-- ============================================
-- SCRIPT DE MONITOREO: Versiones DESPUÉS del cambio
-- ============================================
-- Ejecutar INMEDIATAMENTE después de guardar cambios

SELECT
    '=== CAMBIOS DETECTADOS ===' as seccion;

-- 1. Nueva versión actual
SELECT
    'VERSION_NUEVA' as tipo,
    id,
    version_actual,
    version_lock,
    fecha_ultima_modificacion
FROM negociaciones
WHERE id = '105f3121-8d56-4b29-adac-380cebdc1faf';

-- 2. CRÍTICO: Versiones creadas en los últimos 30 segundos
SELECT
    'VERSIONES_RECIENTES' as tipo,
    version,
    tipo_cambio,
    razon_cambio,
    fecha_cambio,
    EXTRACT(EPOCH FROM (NOW() - fecha_cambio)) as segundos_desde_creacion,
    LENGTH(fuentes_pago_snapshot::text) as tamano_snapshot
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND fecha_cambio > NOW() - INTERVAL '30 seconds'
ORDER BY version DESC;

-- 3. Analizar si hay duplicados por timestamp
SELECT
    'DUPLICADOS_POR_TIMESTAMP' as tipo,
    DATE_TRUNC('second', fecha_cambio) as timestamp_grupo,
    COUNT(*) as versiones_en_mismo_segundo,
    STRING_AGG(version::text, ', ') as versiones
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND fecha_cambio > NOW() - INTERVAL '30 seconds'
GROUP BY DATE_TRUNC('second', fecha_cambio)
HAVING COUNT(*) > 1;

-- 4. Fuentes activas después del cambio
SELECT
    'FUENTES_DESPUES' as tipo,
    tipo,
    monto_aprobado,
    estado_fuente
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND estado_fuente = 'activa'
ORDER BY tipo;

-- 5. Fuentes inactivadas recientemente
SELECT
    'FUENTES_INACTIVADAS' as tipo,
    tipo,
    monto_aprobado,
    estado_fuente,
    fecha_inactivacion,
    LEFT(razon_inactivacion, 50) as razon
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND estado_fuente = 'inactiva'
  AND fecha_inactivacion > NOW() - INTERVAL '30 seconds'
ORDER BY fecha_inactivacion DESC;

-- 6. Resumen de cambios
SELECT
    'RESUMEN' as tipo,
    (SELECT COUNT(*) FROM negociaciones_historial
     WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
       AND fecha_cambio > NOW() - INTERVAL '30 seconds') as versiones_creadas,
    (SELECT COUNT(*) FROM fuentes_pago
     WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
       AND estado_fuente = 'activa') as fuentes_activas_ahora,
    (SELECT COUNT(*) FROM fuentes_pago
     WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
       AND estado_fuente = 'inactiva'
       AND fecha_inactivacion > NOW() - INTERVAL '30 seconds') as fuentes_inactivadas_ahora;
