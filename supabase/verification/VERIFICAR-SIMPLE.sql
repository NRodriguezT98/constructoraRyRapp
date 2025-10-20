-- =====================================================
-- 🔍 VERIFICACIÓN SIMPLE - A PRUEBA DE ERRORES
-- Ejecuta este script primero (NO falla nunca)
-- =====================================================

-- 1. ¿Existe la tabla 'clientes'?
SELECT
    CASE
        WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'clientes' AND schemaname = 'public')
        THEN '✅ SÍ existe'
        ELSE '❌ NO existe'
    END as tabla_clientes;

-- 2. ¿Existe la tabla 'clientes_old'?
SELECT
    CASE
        WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'clientes_old' AND schemaname = 'public')
        THEN '✅ SÍ existe (temporal)'
        ELSE '❌ NO existe'
    END as tabla_clientes_old;

-- 3. Si existe 'clientes', ¿qué columnas tiene?
SELECT
    CASE
        WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'nombres')
        THEN '✅ ESTRUCTURA NUEVA ← ¡Ya está migrado!'
        WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'nombre')
        THEN '⚠️  ESTRUCTURA ANTIGUA ← Necesita migración'
        ELSE '❌ No existe tabla clientes'
    END as estructura;

-- 4. Ver todas las columnas de 'clientes' (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'clientes' AND schemaname = 'public') THEN
        RAISE NOTICE '=== COLUMNAS DE TABLA CLIENTES ===';
    END IF;
END $$;

SELECT column_name
FROM information_schema.columns
WHERE table_name = 'clientes'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 📊 RESUMEN Y RECOMENDACIÓN
-- =====================================================

-- INTERPRETACIÓN:
-- ┌─────────────────────────────────────────────────────┐
-- │ CASO A: clientes existe + ESTRUCTURA NUEVA          │
-- │ → ✅ ¡YA ESTÁ MIGRADO!                              │
-- │ → ACCIÓN: Ejecutar Paso 2 (negociaciones)          │
-- │ → SQL: Ver archivo negociaciones-schema.sql        │
-- └─────────────────────────────────────────────────────┘
--
-- ┌─────────────────────────────────────────────────────┐
-- │ CASO B: clientes existe + ESTRUCTURA ANTIGUA        │
-- │ → ⚠️  NECESITA MIGRACIÓN                            │
-- │ → ACCIÓN: Ejecutar migracion-clientes-segura.sql   │
-- └─────────────────────────────────────────────────────┘
--
-- ┌─────────────────────────────────────────────────────┐
-- │ CASO C: clientes NO existe                          │
-- │ → ❌ TABLA NO CREADA                                │
-- │ → ACCIÓN: Ejecutar schema.sql primero               │
-- │ → Luego: migracion-clientes-segura.sql             │
-- └─────────────────────────────────────────────────────┘

-- =====================================================
-- 🎯 PRÓXIMO PASO SEGÚN TU RESULTADO:
-- =====================================================

-- Si estructura = "NUEVA" → Ejecuta esto:
-- ```powershell
-- Get-Content .\supabase\negociaciones-schema.sql | Set-Clipboard
-- ```

-- Si estructura = "ANTIGUA" → Ejecuta esto:
-- ```powershell
-- Get-Content .\supabase\migracion-clientes-segura.sql | Set-Clipboard
-- ```

-- Si clientes NO existe → Ejecuta esto:
-- ```powershell
-- Get-Content .\supabase\schema.sql | Set-Clipboard
-- ```
