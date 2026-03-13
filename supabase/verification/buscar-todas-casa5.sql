-- Buscar TODAS las casas número 5
SELECT
  v.id,
  v.numero as casa,
  m.nombre as manzana,
  p.nombre as proyecto,
  v.estado,
  v.cliente_id,
  v.negociacion_id
FROM viviendas v
INNER JOIN manzanas m ON v.manzana_id = m.id
INNER JOIN proyectos p ON m.proyecto_id = p.id
WHERE v.numero = '5'
ORDER BY m.nombre;
