-- ============================================
-- VERIFICAR: Estado exacto de Casa 5 Manzana A
-- ============================================

SELECT
  'Casa 5 Manzana A' as vivienda,
  v.id,
  v.numero,
  m.nombre as manzana,
  v.estado,
  v.cliente_id,
  v.negociacion_id,
  CASE
    WHEN v.estado = 'Disponible' AND v.cliente_id IS NULL AND v.negociacion_id IS NULL
    THEN '✅ DEBE APARECER EN SELECTOR'
    WHEN v.estado != 'Disponible'
    THEN '❌ Estado no es Disponible: ' || v.estado
    WHEN v.cliente_id IS NOT NULL
    THEN '❌ Tiene cliente_id: ' || v.cliente_id::text
    WHEN v.negociacion_id IS NOT NULL
    THEN '❌ Tiene negociacion_id: ' || v.negociacion_id::text
    ELSE '⚠️ Problema desconocido'
  END as diagnostico
FROM viviendas v
INNER JOIN manzanas m ON v.manzana_id = m.id
WHERE v.numero = '5' AND m.nombre = 'Manzana A';
