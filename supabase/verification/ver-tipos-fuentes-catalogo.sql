-- Ver tipos de fuentes registrados en el catálogo
SELECT
  id,
  nombre,
  codigo,
  es_subsidio,
  activo,
  orden
FROM tipos_fuentes_pago
ORDER BY orden, nombre;
