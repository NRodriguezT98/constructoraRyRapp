-- ============================================
-- ESTANDARIZACIÓN DE NOMBRES DE FUENTES
-- ============================================
--
-- Corrige las inconsistencias de nombres entre:
-- 1. fuentes_pago.tipo (campo texto libre con errores)
-- 2. requisitos_fuentes_pago_config.tipo_fuente (con errores copiados)
-- 3. tipos_fuentes_pago.nombre (FUENTE ÚNICA DE VERDAD)
--
-- ============================================

-- 1. Ver nombres OFICIALES del catálogo
SELECT
  '=== CATÁLOGO OFICIAL (tipos_fuentes_pago) ===' as seccion,
  nombre as nombre_oficial,
  codigo
FROM tipos_fuentes_pago
WHERE activo = true
ORDER BY orden;

-- ============================================

-- 2. Ver nombres INCORRECTOS en uso
SELECT
  '=== NOMBRES EN USO (con errores) ===' as seccion,
  tipo_fuente as nombre_incorrecto,
  COUNT(*) as cantidad_requisitos
FROM requisitos_fuentes_pago_config
WHERE activo = true
GROUP BY tipo_fuente
ORDER BY tipo_fuente;

-- ============================================

-- 3. CORREGIR: "Subsidio Caja de Compensación" → "Subsidio Caja Compensación"
UPDATE requisitos_fuentes_pago_config
SET
  tipo_fuente = 'Subsidio Caja Compensación',
  fecha_actualizacion = NOW()
WHERE tipo_fuente = 'Subsidio Caja de Compensación'
  AND activo = true;

-- Resultado esperado:
-- UPDATE 1 (o más si hay múltiples requisitos)

-- ============================================

-- 4. Verificar resultado FINAL
SELECT
  '=== RESULTADO DESPUÉS DE CORRECCIÓN ===' as seccion,
  tipo_fuente,
  COUNT(*) as cantidad_requisitos
FROM requisitos_fuentes_pago_config
WHERE activo = true
GROUP BY tipo_fuente
ORDER BY tipo_fuente;

-- Debe mostrar solo nombres oficiales:
-- - Crédito Hipotecario
-- - Cuota Inicial
-- - Subsidio Caja Compensación
-- - Subsidio Mi Casa Ya

-- ============================================

-- 5. VALIDAR: Verificar que todos los nombres coinciden con el catálogo
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

-- Todos deben mostrar ✅ VÁLIDO

-- ============================================

COMMENT ON COLUMN requisitos_fuentes_pago_config.tipo_fuente IS
'Debe coincidir EXACTAMENTE con tipos_fuentes_pago.nombre (catálogo oficial)';
