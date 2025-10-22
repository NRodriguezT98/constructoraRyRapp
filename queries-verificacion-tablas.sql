SS-- =====================================================
-- QUERIES INDIVIDUALES PARA CADA TABLA
-- =====================================================
--
-- Ejecuta cada query por separado en Supabase
-- Copia los resultados de cada una
--
-- =====================================================

-- ============================================
-- TABLA: clientes
-- ============================================

SELECT
  ordinal_position as numero,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,
  COALESCE(column_default, '') as valor_default
FROM information_schema.columns
WHERE table_name = 'clientes' AND table_schema = 'public'
ORDER BY ordinal_position;


-- ============================================
-- TABLA: proyectos
-- ============================================

SELECT
  ordinal_position as numero,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,
  COALESCE(column_default, '') as valor_default
FROM information_schema.columns
WHERE table_name = 'proyectos' AND table_schema = 'public'
ORDER BY ordinal_position;


-- ============================================
-- TABLA: manzanas
-- ============================================

SELECT
  ordinal_position as numero,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,
  COALESCE(column_default, '') as valor_default
FROM information_schema.columns
WHERE table_name = 'manzanas' AND table_schema = 'public'
ORDER BY ordinal_position;


-- ============================================
-- TABLA: viviendas
-- ============================================

SELECT
  ordinal_position as numero,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,
  COALESCE(column_default, '') as valor_default
FROM information_schema.columns
WHERE table_name = 'viviendas' AND table_schema = 'public'
ORDER BY ordinal_position;


-- ============================================
-- TABLA: negociaciones
-- ============================================

SELECT
  ordinal_position as numero,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,
  COALESCE(column_default, '') as valor_default
FROM information_schema.columns
WHERE table_name = 'negociaciones' AND table_schema = 'public'
ORDER BY ordinal_position;


-- ============================================
-- TABLA: fuentes_pago
-- ============================================

SELECT
  ordinal_position as numero,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,
  COALESCE(column_default, '') as valor_default
FROM information_schema.columns
WHERE table_name = 'fuentes_pago' AND table_schema = 'public'
ORDER BY ordinal_position;


-- ============================================
-- TABLA: abonos_historial
-- ============================================

SELECT
  ordinal_position as numero,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,
  COALESCE(column_default, '') as valor_default
FROM information_schema.columns
WHERE table_name = 'abonos_historial' AND table_schema = 'public'
ORDER BY ordinal_position;


-- ============================================
-- TABLA: renuncias
-- ============================================

SELECT
  ordinal_position as numero,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,
  COALESCE(column_default, '') as valor_default
FROM information_schema.columns
WHERE table_name = 'renuncias' AND table_schema = 'public'
ORDER BY ordinal_position;


-- ============================================
-- TABLA: documentos
-- ============================================

SELECT
  ordinal_position as numero,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,
  COALESCE(column_default, '') as valor_default
FROM information_schema.columns
WHERE table_name = 'documentos' AND table_schema = 'public'
ORDER BY ordinal_position;


-- ============================================
-- TABLA: categorias_documentos
-- ============================================

SELECT
  ordinal_position as numero,
  column_name as columna,
  data_type as tipo,
  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,
  COALESCE(column_default, '') as valor_default
FROM information_schema.columns
WHERE table_name = 'categorias_documentos' AND table_schema = 'public'
ORDER BY ordinal_position;
