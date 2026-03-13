-- Query simple sin \echo
SELECT
    'FUENTES ACTIVAS' as categoria,
    COUNT(*) as cantidad
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND estado_fuente = 'activa'

UNION ALL

SELECT
    'FUENTES INACTIVAS' as categoria,
    COUNT(*) as cantidad
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND estado_fuente = 'inactiva'

UNION ALL

SELECT
    'TOTAL FUENTES' as categoria,
    COUNT(*) as cantidad
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf';
