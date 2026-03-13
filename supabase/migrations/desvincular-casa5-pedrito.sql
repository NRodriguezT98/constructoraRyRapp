-- Desvincular Casa 5 de Pedrito (SOLO cliente_id)
UPDATE viviendas
SET cliente_id = NULL
WHERE id = '68c79477-9796-4b60-be8a-e5834d1f06aa';

-- Verificar resultado
SELECT
  v.numero as casa,
  m.nombre as manzana,
  v.estado,
  v.cliente_id,
  v.negociacion_id,
  CASE
    WHEN v.cliente_id IS NULL THEN '✅ Libre'
    ELSE '❌ Aún vinculada'
  END as disponibilidad
FROM viviendas v
INNER JOIN manzanas m ON v.manzana_id = m.id
WHERE v.id = '68c79477-9796-4b60-be8a-e5834d1f06aa';
