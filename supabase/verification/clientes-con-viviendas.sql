-- Ver clientes con viviendas asignadas (para probar desvinculación)
SELECT
  c.id as cliente_id,
  c.nombres || ' ' || c.apellidos as cliente,
  c.estado as estado_cliente,
  v.id as vivienda_id,
  v.numero as casa,
  m.nombre as manzana,
  v.estado as estado_vivienda,
  n.id as negociacion_id,
  n.estado as estado_negociacion
FROM clientes c
INNER JOIN viviendas v ON v.cliente_id = c.id
INNER JOIN manzanas m ON v.manzana_id = m.id
LEFT JOIN negociaciones n ON n.vivienda_id = v.id AND n.cliente_id = c.id
WHERE c.estado = 'Activo'
ORDER BY c.nombres;
