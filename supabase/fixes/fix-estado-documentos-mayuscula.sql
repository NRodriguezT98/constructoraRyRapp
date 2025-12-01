-- ============================================
-- FIX CRÍTICO: Normalizar estado de documentos
-- ============================================
-- PROBLEMA: Documentos se guardan con 'Activo' pero la query busca 'activo'
-- SOLUCIÓN: Cambiar todos los estados a minúscula
-- AFECTADOS: documentos_proyecto, documentos_vivienda, documentos_cliente
-- FECHA: 2025-12-01

-- ============================================
-- 1. VERIFICAR DOCUMENTOS AFECTADOS
-- ============================================

-- Contar documentos con 'Activo' en mayúscula
SELECT
  'documentos_proyecto' AS tabla,
  COUNT(*) AS documentos_afectados
FROM documentos_proyecto
WHERE estado = 'Activo'

UNION ALL

SELECT
  'documentos_vivienda' AS tabla,
  COUNT(*) AS documentos_afectados
FROM documentos_vivienda
WHERE estado = 'Activo'

UNION ALL

SELECT
  'documentos_cliente' AS tabla,
  COUNT(*) AS documentos_afectados
FROM documentos_cliente
WHERE estado = 'Activo';

-- ============================================
-- 2. NORMALIZAR ESTADOS A MINÚSCULA
-- ============================================

-- Proyectos
UPDATE documentos_proyecto
SET estado = 'activo'
WHERE estado = 'Activo';

-- Viviendas
UPDATE documentos_vivienda
SET estado = 'activo'
WHERE estado = 'Activo';

-- Clientes
UPDATE documentos_cliente
SET estado = 'activo'
WHERE estado = 'Activo';

-- ============================================
-- 3. VERIFICAR CORRECCIÓN
-- ============================================

SELECT
  'documentos_proyecto' AS tabla,
  COUNT(*) AS documentos_activos_minuscula
FROM documentos_proyecto
WHERE estado = 'activo'

UNION ALL

SELECT
  'documentos_vivienda' AS tabla,
  COUNT(*) AS documentos_activos_minuscula
FROM documentos_vivienda
WHERE estado = 'activo'

UNION ALL

SELECT
  'documentos_cliente' AS tabla,
  COUNT(*) AS documentos_activos_minuscula
FROM documentos_cliente
WHERE estado = 'activo';

-- ============================================
-- 4. CONFIRMAR NO HAY DOCUMENTOS CON MAYÚSCULA
-- ============================================

SELECT
  'documentos_proyecto' AS tabla,
  COUNT(*) AS documentos_con_mayuscula
FROM documentos_proyecto
WHERE estado = 'Activo'

UNION ALL

SELECT
  'documentos_vivienda' AS tabla,
  COUNT(*) AS documentos_con_mayuscula
FROM documentos_vivienda
WHERE estado = 'Activo'

UNION ALL

SELECT
  'documentos_cliente' AS tabla,
  COUNT(*) AS documentos_con_mayuscula
FROM documentos_cliente
WHERE estado = 'Activo';

-- ✅ RESULTADO ESPERADO:
-- Todas las queries deberían mostrar 0 documentos con mayúscula
-- y todos los documentos deberían estar con 'activo' en minúscula
