-- Mostrar resumen de fuentes_pago reales por tipo
SELECT
    tipo,
    COUNT(*) as total_registros,
    COUNT(DISTINCT negociacion_id) as negociaciones_distintas
FROM fuentes_pago
WHERE estado_fuente = 'activa'
GROUP BY tipo
ORDER BY tipo;
