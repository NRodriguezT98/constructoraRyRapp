-- =====================================================
-- 🔍 VERIFICAR ESTADO ACTUAL Y DECIDIR QUÉ HACER
-- Ejecuta este script primero para saber cómo proceder
-- =====================================================

-- 1. ¿Qué tablas de clientes existen?
SELECT
    CASE
        WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'clientes' AND schemaname = 'public')
        THEN '✅ Tabla clientes existe'
        ELSE '❌ Tabla clientes NO existe'
    END as tabla_clientes,
    CASE
        WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'clientes_old' AND schemaname = 'public')
        THEN '✅ Tabla clientes_old existe'
        ELSE '❌ Tabla clientes_old NO existe'
    END as tabla_clientes_old;

-- 2. Si existe 'clientes', ¿qué estructura tiene?
SELECT
    CASE
        WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'nombres')
        THEN '✅ ESTRUCTURA NUEVA (nombres, apellidos, estado, origen)'
        WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'nombre')
        THEN '⚠️  ESTRUCTURA ANTIGUA (nombre, apellido, documento_tipo)'
        ELSE '❌ No existe tabla clientes'
    END as estructura_clientes;

-- 3. Contar registros (de forma segura)
SELECT
    COALESCE((SELECT COUNT(*) FROM clientes), 0) as registros_en_clientes,
    COALESCE((SELECT COUNT(*) FROM clientes_old WHERE EXISTS (SELECT FROM pg_tables WHERE tablename = 'clientes_old')), 0) as registros_en_clientes_old;

-- 4. Ver columnas actuales de tabla clientes
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 📋 INTERPRETACIÓN Y ACCIÓN RECOMENDADA:
-- =====================================================

-- CASO 1: ✅ clientes existe CON estructura NUEVA (tiene 'nombres')
-- → ACCIÓN: ¡Ya está migrado! Ejecuta Paso 2 (negociaciones-schema.sql)
-- → Si existe clientes_old, elimínala: DROP TABLE clientes_old CASCADE;

-- CASO 2: ⚠️ clientes existe CON estructura ANTIGUA (tiene 'nombre')
-- → ACCIÓN: Ejecuta migracion-clientes-segura.sql

-- CASO 3: ❌ clientes NO existe pero clientes_old SÍ
-- → ACCIÓN: Ejecuta migracion-clientes-segura.sql

-- CASO 4: ❌ Ninguna tabla existe
-- → ACCIÓN: Ejecuta schema.sql primero para crear estructura base

-- =====================================================
-- 🎯 SCRIPT DE SOLUCIÓN RÁPIDA (copia según tu caso)
-- =====================================================

-- SOLUCIÓN A: Si clientes tiene estructura nueva pero existe clientes_old
-- DROP TABLE IF EXISTS clientes_old CASCADE;

-- SOLUCIÓN B: Si clientes tiene estructura antigua
-- ALTER TABLE clientes RENAME TO clientes_old;
-- Luego ejecuta migracion-clientes-segura.sql

-- SOLUCIÓN C: Si no existe ninguna tabla
-- Ejecuta primero: schema.sql
-- Luego ejecuta: migracion-clientes-segura.sql

-- SOLUCIÓN D: Empezar de cero (CUIDADO: elimina todo)
-- DROP TABLE IF EXISTS clientes CASCADE;
-- DROP TABLE IF EXISTS clientes_old CASCADE;
-- Luego ejecuta: migracion-clientes-segura.sql
