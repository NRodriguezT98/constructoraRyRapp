-- =====================================================
-- 📊 GENERADOR DE DOCUMENTACIÓN COMPLETA DE BASE DE DATOS V2
-- =====================================================
--
-- VERSIÓN MEJORADA: Todos los resultados en UNA SOLA CONSULTA
--
-- INSTRUCCIONES:
-- 1. Ejecuta este script COMPLETO en Supabase SQL Editor
-- 2. Verás TODAS las tablas con sus columnas en un solo resultado
-- 3. Copia TODO el resultado
-- 4. Actualiza docs/DATABASE-SCHEMA-REFERENCE.md
--
-- =====================================================

-- Crear tabla temporal para almacenar todos los resultados
CREATE TEMP TABLE IF NOT EXISTS db_documentation (
  orden INTEGER,
  seccion TEXT,
  tabla TEXT,
  columna TEXT,
  tipo TEXT,
  nullable TEXT,
  info_adicional TEXT
);

-- Insertar header
INSERT INTO db_documentation VALUES
(0, '=== DOCUMENTACIÓN COMPLETA DE BASE DE DATOS ===', '', '', '', '', '');

-- Insertar resumen de tablas
INSERT INTO db_documentation
SELECT
  1000 + ROW_NUMBER() OVER (ORDER BY table_name)::INTEGER as orden,
  '📋 LISTADO DE TABLAS' as seccion,
  table_name as tabla,
  (SELECT COUNT(*)::TEXT FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as columna,
  'BASE TABLE' as tipo,
  '' as nullable,
  '' as info_adicional
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- CLIENTES
-- =====================================================
INSERT INTO db_documentation VALUES
(2000, '═══════════════════════════════════════════', '', '', '', '', '');

INSERT INTO db_documentation VALUES
(2001, '📋 TABLA: clientes', '', '', '', '', '');

INSERT INTO db_documentation
SELECT
  2002 + ordinal_position::INTEGER as orden,
  'clientes' as seccion,
  table_name as tabla,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as nullable,
  COALESCE(column_default::TEXT, '') as info_adicional
FROM information_schema.columns
WHERE table_name = 'clientes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- PROYECTOS
-- =====================================================
INSERT INTO db_documentation VALUES
(3000, '═══════════════════════════════════════════', '', '', '', '', '');

INSERT INTO db_documentation VALUES
(3001, '📋 TABLA: proyectos', '', '', '', '', '');

INSERT INTO db_documentation
SELECT
  3002 + ordinal_position::INTEGER as orden,
  'proyectos' as seccion,
  table_name as tabla,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as nullable,
  COALESCE(column_default::TEXT, '') as info_adicional
FROM information_schema.columns
WHERE table_name = 'proyectos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- MANZANAS
-- =====================================================
INSERT INTO db_documentation VALUES
(4000, '═══════════════════════════════════════════', '', '', '', '', '');

INSERT INTO db_documentation VALUES
(4001, '📋 TABLA: manzanas', '', '', '', '', '');

INSERT INTO db_documentation
SELECT
  4002 + ordinal_position::INTEGER as orden,
  'manzanas' as seccion,
  table_name as tabla,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as nullable,
  COALESCE(column_default::TEXT, '') as info_adicional
FROM information_schema.columns
WHERE table_name = 'manzanas' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- VIVIENDAS
-- =====================================================
INSERT INTO db_documentation VALUES
(5000, '═══════════════════════════════════════════', '', '', '', '', '');

INSERT INTO db_documentation VALUES
(5001, '📋 TABLA: viviendas', '', '', '', '', '');

INSERT INTO db_documentation
SELECT
  5002 + ordinal_position::INTEGER as orden,
  'viviendas' as seccion,
  table_name as tabla,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as nullable,
  COALESCE(column_default::TEXT, '') as info_adicional
FROM information_schema.columns
WHERE table_name = 'viviendas' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- NEGOCIACIONES
-- =====================================================
INSERT INTO db_documentation VALUES
(6000, '═══════════════════════════════════════════', '', '', '', '', '');

INSERT INTO db_documentation VALUES
(6001, '📋 TABLA: negociaciones', '', '', '', '', '');

INSERT INTO db_documentation
SELECT
  6002 + ordinal_position::INTEGER as orden,
  'negociaciones' as seccion,
  table_name as tabla,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as nullable,
  COALESCE(column_default::TEXT, '') as info_adicional
FROM information_schema.columns
WHERE table_name = 'negociaciones' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- FUENTES_PAGO
-- =====================================================
INSERT INTO db_documentation VALUES
(7000, '═══════════════════════════════════════════', '', '', '', '', '');

INSERT INTO db_documentation VALUES
(7001, '📋 TABLA: fuentes_pago', '', '', '', '', '');

INSERT INTO db_documentation
SELECT
  7002 + ordinal_position::INTEGER as orden,
  'fuentes_pago' as seccion,
  table_name as tabla,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as nullable,
  COALESCE(column_default::TEXT, '') as info_adicional
FROM information_schema.columns
WHERE table_name = 'fuentes_pago' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- ABONOS_HISTORIAL
-- =====================================================
INSERT INTO db_documentation VALUES
(8000, '═══════════════════════════════════════════', '', '', '', '', '');

INSERT INTO db_documentation VALUES
(8001, '📋 TABLA: abonos_historial', '', '', '', '', '');

INSERT INTO db_documentation
SELECT
  8002 + ordinal_position::INTEGER as orden,
  'abonos_historial' as seccion,
  table_name as tabla,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as nullable,
  COALESCE(column_default::TEXT, '') as info_adicional
FROM information_schema.columns
WHERE table_name = 'abonos_historial' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- RENUNCIAS (si existe)
-- =====================================================
INSERT INTO db_documentation VALUES
(9000, '═══════════════════════════════════════════', '', '', '', '', '');

INSERT INTO db_documentation VALUES
(9001, '📋 TABLA: renuncias', '', '', '', '', '');

INSERT INTO db_documentation
SELECT
  9002 + ordinal_position::INTEGER as orden,
  'renuncias' as seccion,
  table_name as tabla,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as nullable,
  COALESCE(column_default::TEXT, '') as info_adicional
FROM information_schema.columns
WHERE table_name = 'renuncias' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- DOCUMENTOS (si existe)
-- =====================================================
INSERT INTO db_documentation VALUES
(10000, '═══════════════════════════════════════════', '', '', '', '', '');

INSERT INTO db_documentation VALUES
(10001, '📋 TABLA: documentos', '', '', '', '', '');

INSERT INTO db_documentation
SELECT
  10002 + ordinal_position::INTEGER as orden,
  'documentos' as seccion,
  table_name as tabla,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as nullable,
  COALESCE(column_default::TEXT, '') as info_adicional
FROM information_schema.columns
WHERE table_name = 'documentos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- CATEGORIAS_DOCUMENTOS (si existe)
-- =====================================================
INSERT INTO db_documentation VALUES
(11000, '═══════════════════════════════════════════', '', '', '', '', '');

INSERT INTO db_documentation VALUES
(11001, '📋 TABLA: categorias_documentos', '', '', '', '', '');

INSERT INTO db_documentation
SELECT
  11002 + ordinal_position::INTEGER as orden,
  'categorias_documentos' as seccion,
  table_name as tabla,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as nullable,
  COALESCE(column_default::TEXT, '') as info_adicional
FROM information_schema.columns
WHERE table_name = 'categorias_documentos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- MOSTRAR TODOS LOS RESULTADOS ORDENADOS
-- =====================================================

SELECT
  seccion,
  tabla,
  columna,
  tipo,
  nullable,
  info_adicional
FROM db_documentation
ORDER BY orden;

-- Limpiar tabla temporal
DROP TABLE IF EXISTS db_documentation;
