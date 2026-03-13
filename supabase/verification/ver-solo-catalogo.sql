-- Ver SOLO catálogo oficial
SELECT
  nombre,
  codigo,
  activo
FROM tipos_fuentes_pago
WHERE nombre ILIKE '%subsidio%caja%'
ORDER BY nombre;
