-- Verificar que la migración FK robusta funcionó correctamente
SELECT
    'Fuentes de pago totales' as descripcion,
    COUNT(*) as cantidad
FROM fuentes_pago

UNION ALL

SELECT
    'Fuentes con tipo_fuente_id válido',
    COUNT(*)
FROM fuentes_pago f
JOIN tipos_fuentes_pago t ON f.tipo_fuente_id = t.id

UNION ALL

SELECT
    'Fuentes con tipo_fuente_id NULL',
    COUNT(*)
FROM fuentes_pago
WHERE tipo_fuente_id IS NULL

UNION ALL

SELECT
    'Tipos de fuentes activos',
    COUNT(*)
FROM tipos_fuentes_pago
WHERE activo = true;
