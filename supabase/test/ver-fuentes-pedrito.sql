-- ============================================
-- BUSCAR FUENTES EXISTENTES DE PEDRITO
-- ============================================

-- 1. Ver todas las fuentes de Pedrito (cualquier estado)
SELECT
  fp.id,
  fp.tipo,
  fp.entidad,
  fp.monto_aprobado,
  fp.estado,
  fp.negociacion_id,
  n.vivienda_id,
  v.numero as vivienda_numero,
  m.nombre as manzana
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
LEFT JOIN viviendas v ON v.id = n.vivienda_id
LEFT JOIN manzanas m ON m.id = v.manzana_id
WHERE n.cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'  -- Pedrito
ORDER BY fp.estado DESC;

-- 2. Ver requisitos configurados en el sistema
SELECT DISTINCT
  tipo_fuente,
  COUNT(*) as total_requisitos
FROM requisitos_fuentes_pago_config
WHERE activo = true
GROUP BY tipo_fuente
ORDER BY tipo_fuente;

-- 3. Ver todos los tipos de fuentes de pago que existen
SELECT DISTINCT tipo, COUNT(*) as total
FROM fuentes_pago
GROUP BY tipo
ORDER BY total DESC;
