-- Ver tabla tipos_fuentes_pago y sus registros
SELECT
  id,
  nombre,
  descripcion,
  activo,
  orden,
  icono,
  color
FROM tipos_fuentes_pago
ORDER BY orden, nombre;

-- Ver qué fuentes reales existen con nombres inconsistentes
SELECT DISTINCT
  fp.tipo as nombre_usado_fuentes,
  tfp.nombre as nombre_correcto_catalogo,
  COUNT(fp.id) as cantidad_fuentes
FROM fuentes_pago fp
LEFT JOIN tipos_fuentes_pago tfp ON fp.tipo = tfp.nombre
GROUP BY fp.tipo, tfp.nombre
ORDER BY fp.tipo;
