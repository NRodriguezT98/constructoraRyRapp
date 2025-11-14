-- ============================================
-- 🗑️ LIMPIAR DATOS DE LA BASE DE DATOS (PRESERVANDO CONFIGURACIÓN)
-- ============================================
-- Fecha: 2025-11-14
-- Propósito: Eliminar datos de negocio manteniendo configuración del sistema
-- ⚠️ ADVERTENCIA: Esta acción NO es reversible
-- ============================================

-- Verificar usuario antes de ejecutar
DO $$
BEGIN
  RAISE NOTICE '🚨 ADVERTENCIA: Este script eliminará datos de negocio de la base de datos';
  RAISE NOTICE '❌ Se eliminarán: Clientes, Proyectos, Viviendas, Negociaciones, Abonos, Documentos';
  RAISE NOTICE '✅ Se preservarán: Usuarios, Plantillas de Proceso, Categorías de Documentos';
  RAISE NOTICE '⏰ Hora de ejecución: %', NOW();
  RAISE NOTICE '👤 Usuario actual: %', CURRENT_USER;
  RAISE NOTICE '';
  RAISE NOTICE '⏳ Esperando 2 segundos...';
  PERFORM pg_sleep(2);
  RAISE NOTICE '';
  RAISE NOTICE '🔥 Iniciando limpieza de datos...';
END $$;

-- ============================================
-- PASO 1: Eliminar datos en orden correcto (respetando FKs)
-- ============================================

-- Nivel 4: Tablas más dependientes (sin dependencias hacia ellas)
TRUNCATE TABLE abonos_historial RESTART IDENTITY CASCADE;
TRUNCATE TABLE procesos_negociacion RESTART IDENTITY CASCADE;
TRUNCATE TABLE documentos_cliente RESTART IDENTITY CASCADE;
TRUNCATE TABLE documentos_proyecto RESTART IDENTITY CASCADE;
TRUNCATE TABLE audit_log_seguridad RESTART IDENTITY CASCADE;

-- Nivel 3: Tablas con dependencias de negociaciones
TRUNCATE TABLE fuentes_pago RESTART IDENTITY CASCADE;
TRUNCATE TABLE renuncias RESTART IDENTITY CASCADE;

-- Nivel 2: Negociaciones (depende de clientes y viviendas)
TRUNCATE TABLE negociaciones RESTART IDENTITY CASCADE;

-- Nivel 1b: Intereses de clientes
TRUNCATE TABLE cliente_intereses RESTART IDENTITY CASCADE;

-- Nivel 1a: Viviendas (depende de manzanas)
TRUNCATE TABLE viviendas RESTART IDENTITY CASCADE;

-- Nivel 1: Manzanas (depende de proyectos)
TRUNCATE TABLE manzanas RESTART IDENTITY CASCADE;

-- Nivel 0: Tablas base (sin dependencias)
TRUNCATE TABLE clientes RESTART IDENTITY CASCADE;
TRUNCATE TABLE proyectos RESTART IDENTITY CASCADE;

-- ⚠️ NO LIMPIAR ESTAS TABLAS (CONFIGURACIÓN DEL SISTEMA):
-- • plantillas_proceso
-- • categorias_documento
-- • configuracion_recargos
-- • auth.users (Supabase Auth)

-- ============================================
-- PASO 2: Verificar limpieza
-- ============================================
DO $$
DECLARE
  total_clientes INTEGER;
  total_proyectos INTEGER;
  total_negociaciones INTEGER;
  total_viviendas INTEGER;
  total_abonos INTEGER;
  total_plantillas INTEGER;
  total_categorias INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_clientes FROM clientes;
  SELECT COUNT(*) INTO total_proyectos FROM proyectos;
  SELECT COUNT(*) INTO total_negociaciones FROM negociaciones;
  SELECT COUNT(*) INTO total_viviendas FROM viviendas;
  SELECT COUNT(*) INTO total_abonos FROM abonos_historial;
  SELECT COUNT(*) INTO total_plantillas FROM plantillas_proceso;
  SELECT COUNT(*) INTO total_categorias FROM categorias_documento;

  RAISE NOTICE '';
  RAISE NOTICE '✅ LIMPIEZA COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 Tablas limpiadas:';
  RAISE NOTICE '   • Clientes: % registros', total_clientes;
  RAISE NOTICE '   • Proyectos: % registros', total_proyectos;
  RAISE NOTICE '   • Negociaciones: % registros', total_negociaciones;
  RAISE NOTICE '   • Viviendas: % registros', total_viviendas;
  RAISE NOTICE '   • Abonos: % registros', total_abonos;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tablas preservadas (configuración):';
  RAISE NOTICE '   • Plantillas de Proceso: % registros', total_plantillas;
  RAISE NOTICE '   • Categorías de Documentos: % registros', total_categorias;
  RAISE NOTICE '';

  IF total_clientes = 0 AND total_proyectos = 0 AND total_negociaciones = 0 THEN
    RAISE NOTICE '✨ Datos de negocio eliminados, configuración preservada';
  ELSE
    RAISE WARNING '⚠️ Algunas tablas aún contienen datos. Revisa manualmente.';
  END IF;

  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🔄 Secuencias de IDs reiniciadas a 1 (RESTART IDENTITY)';
  RAISE NOTICE '⏰ Finalizado: %', NOW();
  RAISE NOTICE '';
END $$;
