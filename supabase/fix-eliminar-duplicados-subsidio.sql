-- ============================================
-- ELIMINAR NOMBRES DUPLICADOS Y ESTANDARIZAR
-- ============================================

-- 1. Ver el problema actual
SELECT
  tipo_fuente,
  COUNT(*) as cantidad,
  STRING_AGG(titulo, ', ') as requisitos
FROM requisitos_fuentes_pago_config
WHERE activo = true
  AND tipo_fuente ILIKE '%subsidio%caja%'
GROUP BY tipo_fuente;

-- ============================================

-- 2. Desactivar requisitos con nombre INCORRECTO (con "de")
UPDATE requisitos_fuentes_pago_config
SET
  activo = false,
  fecha_actualizacion = NOW()
WHERE tipo_fuente = 'Subsidio Caja de Compensación'
  AND activo = true;

-- ============================================

-- 3. Verificar que solo quede el nombre CORRECTO (sin "de")
SELECT
  tipo_fuente,
  COUNT(*) as cantidad_activos,
  STRING_AGG(titulo, ', ') as requisitos
FROM requisitos_fuentes_pago_config
WHERE activo = true
  AND tipo_fuente ILIKE '%subsidio%caja%'
GROUP BY tipo_fuente;

-- Debe mostrar solo: "Subsidio Caja Compensación"

-- ============================================

-- 4. Validación final: Todos los nombres coinciden con catálogo
SELECT
  rfc.tipo_fuente,
  CASE
    WHEN tfp.nombre IS NOT NULL THEN '✅ VÁLIDO'
    ELSE '❌ NO EXISTE EN CATÁLOGO'
  END as estado,
  COUNT(rfc.id) as cantidad_requisitos
FROM requisitos_fuentes_pago_config rfc
LEFT JOIN tipos_fuentes_pago tfp
  ON rfc.tipo_fuente = tfp.nombre
  AND tfp.activo = true
WHERE rfc.activo = true
GROUP BY rfc.tipo_fuente, tfp.nombre
ORDER BY rfc.tipo_fuente;
