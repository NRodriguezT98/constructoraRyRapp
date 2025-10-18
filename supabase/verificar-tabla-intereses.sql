-- =====================================================
-- VERIFICAR ESTRUCTURA DE intereses_clientes
-- =====================================================

-- 1️⃣ Ver columnas de la tabla
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'intereses_clientes'
ORDER BY ordinal_position;

-- 2️⃣ Ver índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'intereses_clientes';

-- 3️⃣ Ver políticas RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'intereses_clientes';

-- 4️⃣ Ver funciones relacionadas
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%interes%'
ORDER BY routine_name;

-- 5️⃣ Ver vista
SELECT
  table_name,
  view_definition
FROM information_schema.views
WHERE table_name LIKE '%interes%';

-- =====================================================
-- ✅ EJECUTAR EN SUPABASE PARA VERIFICAR
-- =====================================================
