-- ============================================
-- 🗑️ LIMPIAR TODOS LOS DATOS DE LA BASE DE DATOS
-- ============================================
-- Fecha: 2025-10-22
-- Propósito: Eliminar TODOS los datos manteniendo la estructura
-- ⚠️ ADVERTENCIA: Esta acción NO es reversible
-- ============================================

-- Verificar usuario antes de ejecutar
DO $$
BEGIN
  RAISE NOTICE '🚨 ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos';
  RAISE NOTICE '📋 Tablas que serán limpiadas: 17 tablas principales';
  RAISE NOTICE '⏰ Hora de ejecución: %', NOW();
  RAISE NOTICE '👤 Usuario actual: %', CURRENT_USER;
  RAISE NOTICE '';
  RAISE NOTICE '✋ Si NO deseas continuar, CANCELA ahora (Ctrl+C)';
  RAISE NOTICE '⏳ Esperando 3 segundos...';
  PERFORM pg_sleep(3);
  RAISE NOTICE '';
  RAISE NOTICE '🔥 Iniciando limpieza de datos...';
END $$;

-- ============================================
-- PASO 1: Eliminar datos en orden correcto (respetando FKs)
-- ============================================
-- Nota: No deshabilitamos triggers de sistema, usamos TRUNCATE CASCADE

-- Nivel 4: Tablas más dependientes (sin dependencias hacia ellas)
TRUNCATE TABLE abonos_historial RESTART IDENTITY CASCADE;
TRUNCATE TABLE procesos_negociacion RESTART IDENTITY CASCADE;
TRUNCATE TABLE documentos_cliente RESTART IDENTITY CASCADE;
TRUNCATE TABLE documentos_proyecto RESTART IDENTITY CASCADE;
TRUNCATE TABLE audit_log_seguridad RESTART IDENTITY CASCADE;

-- Nivel 3: Tablas con dependencias de negociaciones
TRUNCATE TABLE fuentes_pago RESTART IDENTITY CASCADE;
TRUNCATE TABLE abonos RESTART IDENTITY CASCADE;
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
TRUNCATE TABLE categorias_documento RESTART IDENTITY CASCADE;
TRUNCATE TABLE plantillas_proceso RESTART IDENTITY CASCADE;
TRUNCATE TABLE configuracion_recargos RESTART IDENTITY CASCADE;

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
BEGIN
  SELECT COUNT(*) INTO total_clientes FROM clientes;
  SELECT COUNT(*) INTO total_proyectos FROM proyectos;
  SELECT COUNT(*) INTO total_negociaciones FROM negociaciones;
  SELECT COUNT(*) INTO total_viviendas FROM viviendas;
  SELECT COUNT(*) INTO total_abonos FROM abonos;

  RAISE NOTICE '';
  RAISE NOTICE '✅ LIMPIEZA COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 Verificación de tablas vacías:';
  RAISE NOTICE '   • Clientes: % registros', total_clientes;
  RAISE NOTICE '   • Proyectos: % registros', total_proyectos;
  RAISE NOTICE '   • Negociaciones: % registros', total_negociaciones;
  RAISE NOTICE '   • Viviendas: % registros', total_viviendas;
  RAISE NOTICE '   • Abonos: % registros', total_abonos;
  RAISE NOTICE '';

  IF total_clientes = 0 AND total_proyectos = 0 AND total_negociaciones = 0 THEN
    RAISE NOTICE '✨ Base de datos limpia y lista para datos frescos';
  ELSE
    RAISE WARNING '⚠️ Algunas tablas aún contienen datos. Revisa manualmente.';
  END IF;

  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🔄 Secuencias de IDs reiniciadas a 1 (RESTART IDENTITY)';
  RAISE NOTICE '⏰ Finalizado: %', NOW();
  RAISE NOTICE '';
  RAISE NOTICE '💡 PRÓXIMO PASO: Insertar datos de configuración base';
  RAISE NOTICE '   Ejecuta: insertar-datos-configuracion-base.sql';
END $$;
