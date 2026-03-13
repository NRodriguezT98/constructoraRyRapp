-- Verificar estado de vivienda Casa 5 en Manzana A
SELECT
  v.id,
  v.numero AS casa,
  m.nombre AS manzana,
  v.estado AS estado_vivienda,
  v.cliente_id,
  v.negociacion_id,
  CASE
    WHEN v.cliente_id IS NULL AND v.negociacion_id IS NULL AND v.estado = 'Disponible'
    THEN 'OK - Disponible'
    ELSE 'ERROR - No disponible'
  END AS diagnostico
FROM viviendas v
INNER JOIN manzanas m ON v.manzana_id = m.id
WHERE v.numero = '5'
  AND m.nombre = 'Manzana A';

-- Verificar estado del cliente Pedrito
SELECT
  id,
  nombre_completo,
  numero_documento,
  estado AS estado_cliente
FROM clientes
WHERE numero_documento = '1233333';

-- Verificar si quedan negociaciones huérfanas
SELECT
  id,
  cliente_id,
  vivienda_id,
  estado
FROM negociaciones
WHERE vivienda_id IN (
  SELECT v.id
  FROM viviendas v
  INNER JOIN manzanas m ON v.manzana_id = m.id
  WHERE v.numero = '5' AND m.nombre = 'Manzana A'
);
