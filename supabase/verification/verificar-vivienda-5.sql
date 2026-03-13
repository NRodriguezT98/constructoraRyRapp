-- ============================================
-- DIAGNÓSTICO: Verificar estado de Casa 5
-- ============================================

-- Estado de la vivienda Casa 5
SELECT
  v.id,
  v.numero,
  v.estado,
  v.cliente_id,
  v.negociacion_id
FROM viviendas v
INNER JOIN manzanas m ON v.manzana_id = m.id
WHERE v.numero = '5'
  AND m.nombre = 'Manzana A'
LIMIT 1;
