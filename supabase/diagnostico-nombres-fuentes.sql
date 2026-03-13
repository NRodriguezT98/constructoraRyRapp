-- ============================================
-- DIAGNÓSTICO: Inconsistencia en Nombres de Fuentes
-- ============================================

-- 1. Ver tipos ÚNICOS en tabla tipos_fuentes_pago
SELECT
  nombre AS "Nombre Exacto",
  COUNT(*) as "Cantidad"
FROM tipos_fuentes_pago
WHERE nombre ILIKE '%subsidio%caja%'
GROUP BY nombre
ORDER BY nombre;

-- 2. Ver fuentes REALES creadas con esos nombres
SELECT
  tipo AS "Tipo de Fuente",
  entidad,
  monto_aprobado,
  estado,
  COUNT(*) OVER (PARTITION BY tipo) as "Total con este tipo"
FROM fuentes_pago
WHERE tipo ILIKE '%subsidio%caja%'
ORDER BY tipo, entidad;

-- 3. Ver requisitos configurados con esos nombres
SELECT
  tipo_fuente AS "Tipo en Requisitos",
  titulo AS "Requisito",
  activo,
  COUNT(*) OVER (PARTITION BY tipo_fuente) as "Total requisitos"
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente ILIKE '%subsidio%caja%'
ORDER BY tipo_fuente, titulo;

-- 4. Comparación lado a lado
SELECT
  'tipos_fuentes_pago' as tabla,
  nombre as valor
FROM tipos_fuentes_pago
WHERE nombre ILIKE '%subsidio%caja%'

UNION ALL

SELECT DISTINCT
  'fuentes_pago' as tabla,
  tipo as valor
FROM fuentes_pago
WHERE tipo ILIKE '%subsidio%caja%'

UNION ALL

SELECT DISTINCT
  'requisitos_fuentes_pago_config' as tabla,
  tipo_fuente as valor
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente ILIKE '%subsidio%caja%'

ORDER BY tabla, valor;
