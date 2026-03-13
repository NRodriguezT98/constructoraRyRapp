-- ================================================================
-- VERIFICACIÓN: Sistema de Validación de Fuentes de Pago
-- ================================================================
-- Fecha: 2025-12-13
-- Descripción: Verifica que tabla pasos_fuente_pago y función calcular_progreso_fuente_pago existan
-- ================================================================

-- 1. Verificar existencia de tabla
SELECT
  '🔍 VERIFICACIÓN: Tabla pasos_fuente_pago' AS seccion,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'pasos_fuente_pago'
    ) THEN '✅ Tabla pasos_fuente_pago EXISTE'
    ELSE '❌ Tabla pasos_fuente_pago NO EXISTE'
  END AS status;

-- 2. Listar columnas
SELECT
  '📊 COLUMNAS de pasos_fuente_pago' AS seccion,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pasos_fuente_pago'
ORDER BY ordinal_position;

-- 3. Verificar función
SELECT
  '🔍 VERIFICACIÓN: Función calcular_progreso_fuente_pago' AS seccion,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'calcular_progreso_fuente_pago'
    ) THEN '✅ Función calcular_progreso_fuente_pago EXISTE'
    ELSE '❌ Función calcular_progreso_fuente_pago NO EXISTE'
  END AS status;

-- 4. Contar registros en pasos_fuente_pago
SELECT
  '📈 CONTEO de registros' AS seccion,
  COUNT(*) AS total_pasos,
  COUNT(*) FILTER (WHERE completado = TRUE) AS pasos_completados,
  COUNT(*) FILTER (WHERE completado = FALSE) AS pasos_pendientes
FROM public.pasos_fuente_pago;
