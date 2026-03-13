-- ============================================================================
-- VERIFICACIÓN: ¿Se eliminó el duplicado de Subsidio Caja Compensación?
-- ============================================================================

-- 1. REQUISITOS ACTIVOS (debe mostrar solo "Subsidio Caja Compensación" sin "de")
SELECT
  'REQUISITOS ACTIVOS' as seccion,
  id,
  tipo_fuente,
  categoria_documento,
  activo
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente ILIKE '%subsidio%caja%compensación%'
  AND activo = true
ORDER BY tipo_fuente;

-- 2. REQUISITOS DESACTIVADOS (debe mostrar "Subsidio Caja de Compensación" con "de")
SELECT
  'REQUISITOS DESACTIVADOS' as seccion,
  id,
  tipo_fuente,
  categoria_documento,
  activo
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente ILIKE '%subsidio%caja%compensación%'
  AND activo = false
ORDER BY tipo_fuente;

-- 3. CATÁLOGO OFICIAL (debe tener solo "Subsidio Caja Compensación")
SELECT
  'CATÁLOGO OFICIAL tipos_fuentes_pago' as seccion,
  id,
  nombre,
  codigo,
  activo
FROM tipos_fuentes_pago
WHERE nombre ILIKE '%subsidio%caja%'
ORDER BY nombre;

-- 4. RESUMEN DE TOTALES
SELECT
  'RESUMEN' as seccion,
  tipo_fuente,
  COUNT(*) as total,
  SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as activos,
  SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as inactivos
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente ILIKE '%subsidio%caja%compensación%'
GROUP BY tipo_fuente
ORDER BY tipo_fuente;
