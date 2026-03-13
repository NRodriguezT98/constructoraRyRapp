-- Ver las 4 fuentes oficiales con sus IDs EXACTOS
SELECT
  id,
  nombre,
  codigo,
  descripcion,
  es_subsidio,
  orden,
  activo
FROM tipos_fuentes_pago
ORDER BY orden;
