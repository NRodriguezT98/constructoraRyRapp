-- =====================================================
-- 📊 GENERADOR DE DOCUMENTACIÓN COMPLETA DE BASE DE DATOS
-- =====================================================
--
-- PROPÓSITO: Obtener TODA la información exacta de la base de datos
-- para crear documentación precisa y evitar errores de nombres de campos
--
-- INSTRUCCIONES:
-- 1. Ejecuta este script COMPLETO en Supabase SQL Editor
-- 2. Copia TODOS los resultados
-- 3. Actualiza docs/DATABASE-SCHEMA-REFERENCE.md con la info REAL
-- 4. SIEMPRE consulta ese documento antes de escribir código
--
-- FRECUENCIA: Ejecutar cada vez que se modifique el esquema de DB
-- =====================================================

-- =====================================================
-- PARTE 1: LISTAR TODAS LAS TABLAS DEL ESQUEMA
-- =====================================================

SELECT
  '🗂️ TABLAS EN EL ESQUEMA PUBLIC' as titulo,
  '' as info;

SELECT
  ROW_NUMBER() OVER (ORDER BY table_name) as "#",
  table_name as "TABLA",
  (SELECT COUNT(*)
   FROM information_schema.columns
   WHERE table_name = t.table_name
   AND table_schema = 'public') as "TOTAL_COLUMNAS"
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Separador visual
SELECT '═══════════════════════════════════════════' as separador;

-- =====================================================
-- PARTE 2: DETALLE COMPLETO DE CADA TABLA
-- =====================================================

-- Tabla: CLIENTES
SELECT '📋 TABLA: clientes' as titulo;

SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  character_maximum_length as "LONGITUD_MAX",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  column_default as "VALOR_DEFAULT"
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '═══════════════════════════════════════════' as separador;

-- Tabla: PROYECTOS
SELECT '📋 TABLA: proyectos' as titulo;

SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  character_maximum_length as "LONGITUD_MAX",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  column_default as "VALOR_DEFAULT"
FROM information_schema.columns
WHERE table_name = 'proyectos'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '═══════════════════════════════════════════' as separador;

-- Tabla: MANZANAS
SELECT '📋 TABLA: manzanas' as titulo;

SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  character_maximum_length as "LONGITUD_MAX",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  column_default as "VALOR_DEFAULT"
FROM information_schema.columns
WHERE table_name = 'manzanas'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '═══════════════════════════════════════════' as separador;

-- Tabla: VIVIENDAS
SELECT '📋 TABLA: viviendas' as titulo;

SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  character_maximum_length as "LONGITUD_MAX",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  column_default as "VALOR_DEFAULT"
FROM information_schema.columns
WHERE table_name = 'viviendas'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '═══════════════════════════════════════════' as separador;

-- Tabla: NEGOCIACIONES
SELECT '📋 TABLA: negociaciones' as titulo;

SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  character_maximum_length as "LONGITUD_MAX",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  column_default as "VALOR_DEFAULT"
FROM information_schema.columns
WHERE table_name = 'negociaciones'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '═══════════════════════════════════════════' as separador;

-- Tabla: FUENTES_PAGO
SELECT '📋 TABLA: fuentes_pago' as titulo;

SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  character_maximum_length as "LONGITUD_MAX",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  column_default as "VALOR_DEFAULT"
FROM information_schema.columns
WHERE table_name = 'fuentes_pago'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '═══════════════════════════════════════════' as separador;

-- Tabla: ABONOS_HISTORIAL
SELECT '📋 TABLA: abonos_historial' as titulo;

SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  character_maximum_length as "LONGITUD_MAX",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  column_default as "VALOR_DEFAULT"
FROM information_schema.columns
WHERE table_name = 'abonos_historial'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '═══════════════════════════════════════════' as separador;

-- Tabla: RENUNCIAS
SELECT '📋 TABLA: renuncias' as titulo;

SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  character_maximum_length as "LONGITUD_MAX",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  column_default as "VALOR_DEFAULT"
FROM information_schema.columns
WHERE table_name = 'renuncias'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '═══════════════════════════════════════════' as separador;

-- Tabla: DOCUMENTOS
SELECT '📋 TABLA: documentos' as titulo;

SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  character_maximum_length as "LONGITUD_MAX",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  column_default as "VALOR_DEFAULT"
FROM information_schema.columns
WHERE table_name = 'documentos'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '═══════════════════════════════════════════' as separador;

-- Tabla: CATEGORIAS_DOCUMENTOS
SELECT '📋 TABLA: categorias_documentos' as titulo;

SELECT
  column_name as "COLUMNA",
  data_type as "TIPO",
  character_maximum_length as "LONGITUD_MAX",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  column_default as "VALOR_DEFAULT"
FROM information_schema.columns
WHERE table_name = 'categorias_documentos'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '═══════════════════════════════════════════' as separador;

-- =====================================================
-- PARTE 3: RELACIONES (FOREIGN KEYS)
-- =====================================================

SELECT '🔗 RELACIONES (FOREIGN KEYS)' as titulo;

SELECT
  tc.table_name as "TABLA_ORIGEN",
  kcu.column_name as "COLUMNA_FK",
  ccu.table_name as "TABLA_REFERENCIADA",
  ccu.column_name as "COLUMNA_REFERENCIADA",
  tc.constraint_name as "NOMBRE_CONSTRAINT"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

SELECT '═══════════════════════════════════════════' as separador;

-- =====================================================
-- PARTE 4: CONSTRAINTS Y CHECKS
-- =====================================================

SELECT '✅ CONSTRAINTS Y VALIDACIONES' as titulo;

SELECT
  tc.table_name as "TABLA",
  tc.constraint_name as "NOMBRE_CONSTRAINT",
  tc.constraint_type as "TIPO",
  cc.check_clause as "VALIDACION"
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type IN ('CHECK', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_type;

SELECT '═══════════════════════════════════════════' as separador;

-- =====================================================
-- PARTE 5: ÍNDICES
-- =====================================================

SELECT '🔍 ÍNDICES DE LAS TABLAS' as titulo;

SELECT
  schemaname as "ESQUEMA",
  tablename as "TABLA",
  indexname as "NOMBRE_INDICE",
  indexdef as "DEFINICION"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

SELECT '═══════════════════════════════════════════' as separador;

-- =====================================================
-- PARTE 6: ENUMS Y TIPOS PERSONALIZADOS
-- =====================================================

SELECT '🎨 TIPOS PERSONALIZADOS (ENUMS)' as titulo;

SELECT
  t.typname as "NOMBRE_TIPO",
  e.enumlabel as "VALOR_PERMITIDO",
  e.enumsortorder as "ORDEN"
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

SELECT '═══════════════════════════════════════════' as separador;

-- =====================================================
-- PARTE 7: RESUMEN GENERAL
-- =====================================================

SELECT '📊 RESUMEN GENERAL DE LA BASE DE DATOS' as titulo;

SELECT
  'Total de tablas' as "MÉTRICA",
  COUNT(*)::text as "VALOR"
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'

UNION ALL

SELECT
  'Total de columnas' as "MÉTRICA",
  COUNT(*)::text as "VALOR"
FROM information_schema.columns
WHERE table_schema = 'public'

UNION ALL

SELECT
  'Total de foreign keys' as "MÉTRICA",
  COUNT(*)::text as "VALOR"
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema = 'public'

UNION ALL

SELECT
  'Total de constraints' as "MÉTRICA",
  COUNT(*)::text as "VALOR"
FROM information_schema.table_constraints
WHERE table_schema = 'public';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT '✅ DOCUMENTACIÓN GENERADA EXITOSAMENTE' as resultado;
SELECT 'Copia TODOS los resultados y actualiza docs/DATABASE-SCHEMA-REFERENCE.md' as instruccion;
