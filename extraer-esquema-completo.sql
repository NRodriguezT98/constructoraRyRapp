-- =====================================================
-- EXTRAER ESQUEMA COMPLETO DE LA BASE DE DATOS
-- =====================================================
-- Este script genera toda la información del esquema
-- para actualizar DATABASE-SCHEMA-REFERENCE.md

-- =====================================================
-- 1. LISTADO DE TODAS LAS TABLAS
-- =====================================================
\echo '========================================'
\echo '📋 TABLAS EN LA BASE DE DATOS'
\echo '========================================'
\echo ''

SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo '========================================'
\echo ''

-- =====================================================
-- 2. COLUMNAS DE CADA TABLA (COMPLETO)
-- =====================================================
\echo '📝 ESTRUCTURA COMPLETA DE TODAS LAS TABLAS'
\echo ''

SELECT
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

\echo ''
\echo '========================================'
\echo ''

-- =====================================================
-- 3. CONSTRAINTS (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK)
-- =====================================================
\echo '🔑 CONSTRAINTS DE TODAS LAS TABLAS'
\echo ''

SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.check_constraints cc
    ON cc.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

\echo ''
\echo '========================================'
\echo ''

-- =====================================================
-- 4. ÍNDICES
-- =====================================================
\echo '📇 ÍNDICES DE TODAS LAS TABLAS'
\echo ''

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''
\echo '========================================'
\echo ''

-- =====================================================
-- 5. FUNCIONES Y TRIGGERS
-- =====================================================
\echo '⚙️ FUNCIONES ALMACENADAS'
\echo ''

SELECT
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

\echo ''
\echo '🔔 TRIGGERS'
\echo ''

SELECT
    event_object_table AS table_name,
    trigger_name,
    event_manipulation AS event,
    action_timing AS timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

\echo ''
\echo '========================================'
\echo ''

-- =====================================================
-- 6. VISTAS
-- =====================================================
\echo '👁️ VISTAS'
\echo ''

SELECT
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

\echo ''
\echo '========================================'
\echo ''

-- =====================================================
-- 7. ENUMS (TIPOS PERSONALIZADOS)
-- =====================================================
\echo '🎨 TIPOS ENUMERADOS'
\echo ''

SELECT
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

\echo ''
\echo '========================================'
\echo '✅ EXTRACCIÓN COMPLETA FINALIZADA'
\echo '========================================'
\echo ''
