-- =====================================================
-- SCRIPT DE LIMPIEZA: Módulo de Clientes y Negociaciones
-- ⚠️ CUIDADO: Este script elimina TODAS las tablas del módulo
-- Úsalo solo si quieres empezar de cero
-- =====================================================

-- =====================================================
-- OPCIÓN 1: LIMPIEZA COMPLETA (Elimina todo)
-- =====================================================

-- Eliminar vistas primero
DROP VIEW IF EXISTS vista_clientes_resumen CASCADE;
DROP VIEW IF EXISTS vista_negociaciones_completas CASCADE;

-- Eliminar tablas (CASCADE elimina también foreign keys)
DROP TABLE IF EXISTS procesos_negociacion CASCADE;
DROP TABLE IF EXISTS fuentes_pago CASCADE;
DROP TABLE IF EXISTS negociaciones CASCADE;
DROP TABLE IF EXISTS plantillas_proceso CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS clientes_old CASCADE;

-- Eliminar triggers manualmente (por si acaso)
DROP FUNCTION IF EXISTS update_negociaciones_fecha_actualizacion() CASCADE;
DROP FUNCTION IF EXISTS update_negociaciones_totales() CASCADE;
DROP FUNCTION IF EXISTS update_cliente_estado_on_negociacion() CASCADE;

-- Verificar que todo se eliminó
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%client%'
     OR table_name LIKE '%negoci%'
     OR table_name LIKE '%fuente%'
     OR table_name LIKE '%proceso%');

-- Si este query no devuelve nada, ¡la limpieza fue exitosa! ✅

-- =====================================================
-- OPCIÓN 2: SOLO ELIMINAR clientes_old (Si ya migraste)
-- =====================================================

-- Descomentar esta línea si solo quieres eliminar la tabla antigua
-- DROP TABLE IF EXISTS clientes_old CASCADE;

-- =====================================================
-- DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- =====================================================
-- 1. Ejecuta de nuevo el PASO 1: migracion-clientes.sql
-- 2. Ejecuta PASO 2: negociaciones-schema.sql
-- 3. Ejecuta PASO 3: clientes-negociaciones-rls.sql
-- =====================================================

COMMENT ON SCHEMA public IS 'Limpieza de módulo de clientes completada';
