-- Aclarar diferencia entre tipos_fuentes_pago (catálogo) vs fuentes_pago (instancias)

-- 1. CATÁLOGO: tipos_fuentes_pago (4 tipos configurados)
SELECT
    'CATÁLOGO - tipos_fuentes_pago' as tabla,
    nombre as tipo,
    orden,
    activo
FROM tipos_fuentes_pago
ORDER BY orden;

-- 2. INSTANCIAS: fuentes_pago (registros reales por negociación)
SELECT
    'INSTANCIAS - fuentes_pago' as tabla,
    tipo,
    COUNT(*) as cantidad_registros,
    COUNT(DISTINCT negociacion_id) as negociaciones_distintas
FROM fuentes_pago
WHERE estado_fuente = 'activa'
GROUP BY tipo
ORDER BY tipo;

-- 3. EJEMPLO: Fuentes por negociación específica
SELECT
    'EJEMPLO POR NEGOCIACIÓN' as descripcion,
    negociacion_id,
    tipo,
    monto_aprobado
FROM fuentes_pago
WHERE estado_fuente = 'activa'
ORDER BY negociacion_id, tipo
LIMIT 10;
