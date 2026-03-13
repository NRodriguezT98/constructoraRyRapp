-- Ver todos los nombres que contienen "subsidio" y "caja"
SELECT DISTINCT
  nombre
FROM tipos_fuentes_pago
WHERE nombre ILIKE '%subsidio%caja%'
ORDER BY nombre;
