-- ============================================================
-- AUDITORÍA COMPLETA DE BASE DE DATOS
-- Propósito: Inventariar TODOS los objetos para limpiar lo obsoleto
-- Fecha: 2026-04-02
-- ============================================================

-- ==========================================
-- 1. TODAS LAS TABLAS CON CONTEO DE FILAS
-- ==========================================
SELECT '=== 1. TABLAS Y FILAS ===' as seccion;

SELECT
  t.table_name,
  pg_stat_user_tables.n_live_tup as filas_estimadas,
  pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)::regclass)) as tamano_total
FROM information_schema.tables t
LEFT JOIN pg_stat_user_tables ON pg_stat_user_tables.relname = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- ==========================================
-- 2. TODAS LAS VISTAS
-- ==========================================
SELECT '=== 2. VISTAS ===' as seccion;

SELECT
  table_name as vista_nombre,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ==========================================
-- 3. TODOS LOS TRIGGERS
-- ==========================================
SELECT '=== 3. TRIGGERS ===' as seccion;

SELECT
  trigger_name,
  event_manipulation as evento,
  event_object_table as tabla,
  action_timing as cuando,
  action_statement as ejecuta
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ==========================================
-- 4. TODAS LAS FUNCIONES CUSTOM (no de sistema)
-- ==========================================
SELECT '=== 4. FUNCIONES ===' as seccion;

SELECT
  p.proname as funcion_nombre,
  pg_get_function_arguments(p.oid) as argumentos,
  t.typname as retorna,
  CASE p.prokind
    WHEN 'f' THEN 'FUNCTION'
    WHEN 'p' THEN 'PROCEDURE'
    WHEN 'a' THEN 'AGGREGATE'
  END as tipo,
  length(pg_get_functiondef(p.oid)) as largo_definicion,
  obj_description(p.oid, 'pg_proc') as comentario
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_type t ON p.prorettype = t.oid
WHERE n.nspname = 'public'
  AND p.proname NOT LIKE 'pg_%'
ORDER BY p.proname;

-- ==========================================
-- 5. COLUMNAS DE CADA TABLA (con nullabilidad)
-- ==========================================
SELECT '=== 5. COLUMNAS POR TABLA ===' as seccion;

SELECT
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  c.udt_name
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name IN (
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  )
ORDER BY c.table_name, c.ordinal_position;

-- ==========================================
-- 6. ÍNDICES
-- ==========================================
SELECT '=== 6. ÍNDICES ===' as seccion;

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ==========================================
-- 7. FOREIGN KEYS
-- ==========================================
SELECT '=== 7. FOREIGN KEYS ===' as seccion;

SELECT
  tc.table_name as tabla_origen,
  kcu.column_name as columna_origen,
  ccu.table_name as tabla_destino,
  ccu.column_name as columna_destino,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ==========================================
-- 8. RLS POLICIES
-- ==========================================
SELECT '=== 8. RLS POLICIES ===' as seccion;

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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==========================================
-- 9. ENUMS DEFINIDOS
-- ==========================================
SELECT '=== 9. ENUMS ===' as seccion;

SELECT
  t.typname as enum_nombre,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as valores
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- ==========================================
-- 10. CÓDIGO DE FUNCIONES TRIGGER
-- ==========================================
SELECT '=== 10. CÓDIGO COMPLETO DE FUNCIONES TRIGGER ===' as seccion;

SELECT
  p.proname as funcion_nombre,
  pg_get_functiondef(p.oid) as definicion_completa
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prorettype = 'trigger'::regtype
ORDER BY p.proname;
