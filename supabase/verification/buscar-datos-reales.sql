-- Buscar cliente Pedrito
SELECT
  'CLIENTE' as tipo,
  id,
  nombres,
  apellidos,
  numero_documento,
  estado
FROM clientes
WHERE nombres ILIKE '%Pedrito%' OR nombres ILIKE '%Pedro%'
ORDER BY fecha_creacion DESC
LIMIT 5;

-- Todas las viviendas Casa 5
SELECT
  'VIVIENDA' as tipo,
  v.id,
  v.numero,
  v.estado,
  v.cliente_id,
  v.negociacion_id,
  m.nombre as manzana
FROM viviendas v
LEFT JOIN manzanas m ON v.manzana_id = m.id
WHERE v.numero = '5';
