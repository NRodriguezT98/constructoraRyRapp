-- =====================================================
-- DIAGNÓSTICO: ¿Qué estado tiene tu base de datos?
-- Ejecuta este script para saber qué hacer
-- =====================================================

-- =====================================================
-- 1. VER QUÉ TABLAS EXISTEN ACTUALMENTE
-- =====================================================
SELECT
  table_name,
  CASE
    WHEN table_name = 'clientes' THEN '✅ Tabla principal'
    WHEN table_name = 'clientes_old' THEN '⚠️  Temporal (se puede eliminar)'
    WHEN table_name = 'negociaciones' THEN '✅ Tabla de negociaciones'
    WHEN table_name = 'fuentes_pago' THEN '✅ Tabla de fuentes de pago'
    WHEN table_name = 'procesos_negociacion' THEN '✅ Tabla de procesos'
    WHEN table_name = 'plantillas_proceso' THEN '✅ Tabla de plantillas'
    ELSE 'Otra tabla'
  END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%client%'
     OR table_name LIKE '%negoci%'
     OR table_name LIKE '%fuente%'
     OR table_name LIKE '%proceso%')
ORDER BY table_name;

-- =====================================================
-- 2. VER ESTRUCTURA DE LA TABLA CLIENTES
-- =====================================================
SELECT
  column_name,
  data_type,
  CASE
    WHEN column_name IN ('nombres', 'apellidos', 'estado', 'origen')
    THEN '✅ Nueva estructura'
    WHEN column_name IN ('nombre', 'apellido', 'documento_tipo', 'documento_numero')
    THEN '⚠️  Estructura antigua'
    ELSE 'Otra columna'
  END as tipo_estructura
FROM information_schema.columns
WHERE table_name = 'clientes'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 3. CONTAR REGISTROS EN CADA TABLA
-- =====================================================
SELECT
  'clientes' as tabla,
  COUNT(*) as cantidad,
  '✅ Tabla principal' as estado
FROM clientes
WHERE EXISTS (SELECT 1 FROM clientes LIMIT 1)

UNION ALL

SELECT
  'clientes_old' as tabla,
  COUNT(*) as cantidad,
  '⚠️  Tabla temporal' as estado
FROM clientes_old
WHERE EXISTS (SELECT 1 FROM clientes_old LIMIT 1)

UNION ALL

SELECT
  'negociaciones' as tabla,
  COUNT(*) as cantidad,
  '✅ Tabla de negociaciones' as estado
FROM negociaciones
WHERE EXISTS (SELECT 1 FROM negociaciones LIMIT 1)

UNION ALL

SELECT
  'fuentes_pago' as tabla,
  COUNT(*) as cantidad,
  '✅ Tabla de fuentes' as estado
FROM fuentes_pago
WHERE EXISTS (SELECT 1 FROM fuentes_pago LIMIT 1);

-- =====================================================
-- 4. VER VISTAS CREADAS
-- =====================================================
SELECT
  table_name as vista,
  CASE
    WHEN table_name = 'vista_clientes_resumen' THEN '✅ Vista de resumen'
    WHEN table_name = 'vista_negociaciones_completas' THEN '✅ Vista de negociaciones'
    ELSE 'Otra vista'
  END as estado
FROM information_schema.views
WHERE table_schema = 'public'
AND (table_name LIKE '%client%' OR table_name LIKE '%negoci%')
ORDER BY table_name;

-- =====================================================
-- 5. VER POLÍTICAS RLS APLICADAS
-- =====================================================
SELECT
  tablename,
  COUNT(*) as cantidad_politicas,
  CASE
    WHEN COUNT(*) >= 4 THEN '✅ RLS configurado'
    WHEN COUNT(*) > 0 THEN '⚠️  RLS parcial'
    ELSE '❌ Sin RLS'
  END as estado_rls
FROM pg_policies
WHERE tablename IN ('clientes', 'negociaciones', 'fuentes_pago', 'procesos_negociacion', 'plantillas_proceso')
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- INTERPRETACIÓN DE RESULTADOS:
-- =====================================================

-- ESCENARIO A: Tabla clientes tiene estructura NUEVA
-- → Resultado: Paso 1 ya se ejecutó correctamente ✅
-- → Acción: Eliminar clientes_old y continuar con Paso 2
-- → SQL: DROP TABLE clientes_old CASCADE;

-- ESCENARIO B: Tabla clientes tiene estructura ANTIGUA
-- → Resultado: Paso 1 no se completó ❌
-- → Acción: Limpiar todo y ejecutar Paso 1 de nuevo
-- → SQL: Ver archivo LIMPIAR-MODULO-CLIENTES.sql

-- ESCENARIO C: Existen negociaciones, fuentes_pago, etc.
-- → Resultado: Paso 2 ya se ejecutó ✅
-- → Acción: Verificar Paso 3 (RLS) y continuar

-- ESCENARIO D: Políticas RLS >= 4 por tabla
-- → Resultado: Paso 3 ya se ejecutó ✅
-- → Acción: ¡Todo listo! Solo eliminar clientes_old

-- =====================================================
-- 6. RESUMEN EJECUTIVO
-- =====================================================
SELECT
  'DIAGNÓSTICO COMPLETO' as titulo,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_name IN ('clientes', 'negociaciones', 'fuentes_pago', 'procesos_negociacion')) as tablas_principales,
  (SELECT COUNT(*) FROM information_schema.views
   WHERE table_name LIKE '%client%' OR table_name LIKE '%negoci%') as vistas_creadas,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies
   WHERE tablename IN ('clientes', 'negociaciones', 'fuentes_pago')) as tablas_con_rls,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'nombres')
    THEN '✅ MIGRACIÓN COMPLETADA'
    ELSE '❌ MIGRACIÓN PENDIENTE'
  END as estado_migracion;
