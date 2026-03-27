-- ============================================================
-- LIMPIEZA COMPLETA DE DATOS TRANSACCIONALES
-- ============================================================
-- Elimina TODOS los datos de negocio manteniendo:
--   ✅ Usuarios (auth.users + public.usuarios)
--   ✅ Configuración del panel admin (tipos_fuentes_pago,
--      categorias_documento, permisos, roles, etc.)
--   ✅ Estructura de manzanas y proyectos SOLO si viviendas
--      vacías (viviendas quedan en estado Disponible)
--
-- Elimina:
--   ❌ audit_log
--   ❌ documentos_pendientes
--   ❌ documento_reemplazos_admin
--   ❌ abonos_historial
--   ❌ fuentes_pago
--   ❌ renuncias
--   ❌ negociaciones
--   ❌ documentos_cliente
--   ❌ notas_historial_cliente
--   ❌ documentos_vivienda
--   ❌ documentos_proyecto
--   ❌ viviendas (se recrean vacías via manzanas/proyectos)
--   ❌ manzanas
--   ❌ proyectos
--   ❌ clientes
--   ❌ Secuencias reseteadas a comenzar desde 1
--
-- Ejecución: node ejecutar-sql.js supabase/cleanup/limpiar-datos-completo.sql
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- PASO 1: Deshabilitar triggers para evitar side-effects
--         durante la limpieza masiva
-- ─────────────────────────────────────────────────────────────
SET session_replication_role = replica;

-- ─────────────────────────────────────────────────────────────
-- PASO 2: Auditorías (sin dependencias hacia delante)
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.audit_log;

-- ─────────────────────────────────────────────────────────────
-- PASO 3: Documentos pendientes (tabla puede no existir en todos los envs)
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documentos_pendientes') THEN
    DELETE FROM public.documentos_pendientes;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- PASO 4: Registro de reemplazos de Admin (puede no existir)
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documento_reemplazos_admin') THEN
    DELETE FROM public.documento_reemplazos_admin;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- PASO 5: Abonos
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.abonos_historial;

-- ─────────────────────────────────────────────────────────────
-- PASO 6: Fuentes de pago (de negociaciones, no la config)
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.fuentes_pago;

-- ─────────────────────────────────────────────────────────────
-- PASO 7: Renuncias
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.renuncias;

-- ─────────────────────────────────────────────────────────────
-- PASO 8: Negociaciones
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.negociaciones;

-- ─────────────────────────────────────────────────────────────
-- PASO 9: Documentos de clientes
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.documentos_cliente;

-- ─────────────────────────────────────────────────────────────
-- PASO 10: Notas de historial de clientes (puede no existir)
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notas_historial_cliente') THEN
    DELETE FROM public.notas_historial_cliente;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- PASO 11: Clientes
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.clientes;

-- ─────────────────────────────────────────────────────────────
-- PASO 12: Documentos de viviendas (puede no existir)
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documentos_vivienda') THEN
    DELETE FROM public.documentos_vivienda;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- PASO 13: Viviendas
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.viviendas;

-- ─────────────────────────────────────────────────────────────
-- PASO 14: Manzanas
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.manzanas;

-- ─────────────────────────────────────────────────────────────
-- PASO 15: Documentos de proyectos
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.documentos_proyecto;

-- ─────────────────────────────────────────────────────────────
-- PASO 16: Proyectos
-- ─────────────────────────────────────────────────────────────
DELETE FROM public.proyectos;

-- ─────────────────────────────────────────────────────────────
-- PASO 17: Rehabilitar triggers
-- ─────────────────────────────────────────────────────────────
SET session_replication_role = DEFAULT;

-- ─────────────────────────────────────────────────────────────
-- PASO 18: Resetear secuencia de número de recibo de abonos
-- ─────────────────────────────────────────────────────────────
ALTER SEQUENCE IF EXISTS seq_numero_recibo_global RESTART WITH 1;

-- ─────────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL
-- ─────────────────────────────────────────────────────────────
SELECT tabla, registros FROM (
  SELECT 'clientes'              AS tabla, COUNT(*)::text AS registros FROM public.clientes
  UNION ALL
  SELECT 'proyectos',                      COUNT(*)::text FROM public.proyectos
  UNION ALL
  SELECT 'manzanas',                       COUNT(*)::text FROM public.manzanas
  UNION ALL
  SELECT 'viviendas',                      COUNT(*)::text FROM public.viviendas
  UNION ALL
  SELECT 'negociaciones',                  COUNT(*)::text FROM public.negociaciones
  UNION ALL
  SELECT 'fuentes_pago',                   COUNT(*)::text FROM public.fuentes_pago
  UNION ALL
  SELECT 'abonos_historial',               COUNT(*)::text FROM public.abonos_historial
  UNION ALL
  SELECT 'renuncias',                      COUNT(*)::text FROM public.renuncias
  UNION ALL
  SELECT 'documentos_cliente',             COUNT(*)::text FROM public.documentos_cliente
  UNION ALL
  SELECT 'documentos_proyecto',            COUNT(*)::text FROM public.documentos_proyecto
  UNION ALL
  SELECT 'audit_log',                      COUNT(*)::text FROM public.audit_log
) t
ORDER BY tabla;

COMMIT;
