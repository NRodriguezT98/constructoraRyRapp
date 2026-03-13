-- ================================================================
-- VERIFICACIÓN: Sistema de Validación de Fuentes de Pago
-- ================================================================
-- Verificar que la tabla y triggers fueron creados correctamente
-- ================================================================

-- 1. Verificar estructura de tabla pasos_fuente_pago
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pasos_fuente_pago'
ORDER BY ordinal_position;

-- 2. Verificar triggers creados
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers
WHERE trigger_name LIKE '%paso%' OR trigger_name LIKE '%fuente%'
ORDER BY trigger_name;

-- 3. Verificar función RPC
SELECT
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%progreso%';

-- 4. Verificar políticas RLS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'pasos_fuente_pago';
