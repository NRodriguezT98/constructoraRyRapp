-- Ver TODOS los nombres relacionados con Subsidio Caja
\echo '=== NOMBRES EN TIPOS_FUENTES_PAGO ==='
SELECT nombre FROM tipos_fuentes_pago
WHERE nombre ILIKE '%subsidio%caja%'
ORDER BY nombre;

\echo ''
\echo '=== NOMBRES EN REQUISITOS_FUENTES_PAGO_CONFIG ==='
SELECT DISTINCT tipo_fuente, COUNT(*) as requisitos
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente ILIKE '%subsidio%caja%'
GROUP BY tipo_fuente
ORDER BY tipo_fuente;

\echo ''
\echo '=== NOMBRES EN FUENTES_PAGO (fuentes creadas) ==='
SELECT DISTINCT tipo, COUNT(*) as cantidad
FROM fuentes_pago
WHERE tipo ILIKE '%subsidio%caja%'
GROUP BY tipo
ORDER BY tipo;
