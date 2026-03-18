-- ============================================================
-- DIAGNÓSTICO: Triggers y Funciones en la Base de Datos
-- Fecha: 2026-03-17
-- Propósito: Auditar qué triggers y funciones existen actualmente
-- para detectar obsoletos, duplicados o problemáticos
-- ============================================================

-- ============================================================
-- 1. TODOS LOS TRIGGERS (con estado habilitado/deshabilitado)
-- ============================================================
SELECT
    t.trigger_name,
    t.event_object_table AS tabla,
    t.event_manipulation AS evento,
    t.action_timing AS momento,
    t.action_statement,
    CASE
        WHEN tr.tgenabled = 'D' THEN '❌ DESHABILITADO'
        WHEN tr.tgenabled = 'O' THEN '✅ HABILITADO'
        WHEN tr.tgenabled = 'R' THEN '⚠️ REPLICA'
        WHEN tr.tgenabled = 'A' THEN '✅ SIEMPRE'
        ELSE tr.tgenabled::text
    END AS estado
FROM information_schema.triggers t
JOIN pg_trigger tr ON tr.tgname = t.trigger_name
JOIN pg_class pc ON pc.oid = tr.tgrelid
JOIN pg_namespace pn ON pn.oid = pc.relnamespace
WHERE pn.nspname = 'public'
  AND NOT tr.tgisinternal  -- excluir triggers internos de PostgreSQL
ORDER BY t.event_object_table, t.trigger_name;

-- ============================================================
-- 2. FUNCIONES PERSONALIZADAS (no del sistema)
-- ============================================================
SELECT
    p.proname AS funcion,
    pg_get_function_identity_arguments(p.oid) AS argumentos,
    CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END AS volatilidad,
    p.prosecdef AS security_definer,
    d.description AS comentario
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
LEFT JOIN pg_description d ON d.objoid = p.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'  -- solo funciones (no procedimientos ni agregados)
ORDER BY p.proname;

-- ============================================================
-- 3. TRIGGERS POR TABLA (conteo para detectar acumulación)
-- ============================================================
SELECT
    event_object_table AS tabla,
    COUNT(*) AS total_triggers,
    STRING_AGG(trigger_name, ', ' ORDER BY trigger_name) AS nombres
FROM information_schema.triggers
JOIN pg_trigger tr ON tr.tgname = trigger_name
JOIN pg_class pc ON pc.oid = tr.tgrelid
JOIN pg_namespace pn ON pn.oid = pc.relnamespace
WHERE pn.nspname = 'public'
  AND NOT tr.tgisinternal
GROUP BY event_object_table
ORDER BY total_triggers DESC, event_object_table;

-- ============================================================
-- 4. VISTAS EXISTENTES (para detectar views obsoletas)
-- ============================================================
SELECT
    viewname,
    obj_description(pg_class.oid, 'pg_class') AS comentario
FROM pg_views
JOIN pg_class ON relname = viewname
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE schemaname = 'public'
ORDER BY viewname;

-- ============================================================
-- 5. FUNCIONES CON NOMBRE SIMILAR (detectar duplicados/versiones)
-- ============================================================
SELECT
    SPLIT_PART(proname, '_v', 1) AS base_nombre,
    COUNT(*) AS versiones,
    STRING_AGG(proname, ', ' ORDER BY proname) AS todas_las_versiones
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
GROUP BY SPLIT_PART(proname, '_v', 1)
HAVING COUNT(*) > 1
ORDER BY versiones DESC, base_nombre;
