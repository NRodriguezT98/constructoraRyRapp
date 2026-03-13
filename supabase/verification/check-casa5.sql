-- Verificar Casa 5 - Versión Simple
SELECT
  v.id,
  v.numero as casa,
  m.nombre as manzana,
  v.estado,
  v.cliente_id,
  v.negociacion_id
FROM viviendas v
INNER JOIN manzanas m ON v.manzana_id = m.id
WHERE v.numero = '5'
  AND m.nombre = 'Manzana A'
LIMIT 1;
