-- ============================================================================
-- LIMPIEZA DE ELEMENTOS OBSOLETOS - Base de Datos RyR Constructora
-- Fecha: 2025-10-22
-- Propósito: Eliminar tablas y columnas obsoletas de arquitectura antigua
-- ⚠️ EJECUTAR SOLO DESPUÉS DE VERIFICACIÓN EXITOSA
-- ============================================================================

-- ⚠️ ADVERTENCIA: Este script es IRREVERSIBLE
-- Asegúrate de tener un backup antes de ejecutar

BEGIN;

-- ============================================================================
-- PASO 1: ELIMINAR TABLA abonos (REEMPLAZADA POR abonos_historial)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  🗑️  INICIANDO LIMPIEZA DE BASE DE DATOS                ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '1️⃣  Eliminando tabla abonos...';
END $$;

DROP TABLE IF EXISTS abonos CASCADE;

DO $$
BEGIN
  RAISE NOTICE '   └─ ✅ Tabla abonos eliminada';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PASO 2: ELIMINAR COLUMNAS OBSOLETAS DE negociaciones
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '2️⃣  Eliminando columnas obsoletas de negociaciones...';
END $$;

ALTER TABLE negociaciones
  DROP COLUMN IF EXISTS fecha_cierre_financiero CASCADE,
  DROP COLUMN IF EXISTS fecha_activacion CASCADE,
  DROP COLUMN IF EXISTS fecha_cancelacion CASCADE,
  DROP COLUMN IF EXISTS motivo_cancelacion CASCADE;

DO $$
BEGIN
  RAISE NOTICE '   └─ ✅ fecha_cierre_financiero eliminada';
  RAISE NOTICE '   └─ ✅ fecha_activacion eliminada';
  RAISE NOTICE '   └─ ✅ fecha_cancelacion eliminada';
  RAISE NOTICE '   └─ ✅ motivo_cancelacion eliminada';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PASO 3: ELIMINAR COLUMNAS OBSOLETAS DE viviendas
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '3️⃣  Eliminando columnas obsoletas de viviendas...';
END $$;

ALTER TABLE viviendas
  DROP COLUMN IF EXISTS precio CASCADE,
  DROP COLUMN IF EXISTS fecha_pago_completo CASCADE;

DO $$
BEGIN
  RAISE NOTICE '   └─ ✅ precio eliminada';
  RAISE NOTICE '   └─ ✅ fecha_pago_completo eliminada';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PASO 4: VERIFICACIÓN POST-LIMPIEZA
-- ============================================================================

DO $$
DECLARE
  v_tabla_abonos_existe BOOLEAN;
  v_negociaciones_columnas INT;
  v_viviendas_columnas INT;
BEGIN
  RAISE NOTICE '4️⃣  Verificando limpieza...';
  RAISE NOTICE '';

  -- Verificar que tabla abonos NO existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'abonos'
  ) INTO v_tabla_abonos_existe;

  IF v_tabla_abonos_existe THEN
    RAISE NOTICE '   └─ ❌ ERROR: Tabla abonos aún existe';
  ELSE
    RAISE NOTICE '   └─ ✅ Tabla abonos eliminada correctamente';
  END IF;

  -- Verificar columnas eliminadas de negociaciones
  SELECT COUNT(*) INTO v_negociaciones_columnas
  FROM information_schema.columns
  WHERE table_name = 'negociaciones'
    AND column_name IN (
      'fecha_cierre_financiero',
      'fecha_activacion',
      'fecha_cancelacion',
      'motivo_cancelacion'
    );

  IF v_negociaciones_columnas > 0 THEN
    RAISE NOTICE '   └─ ❌ ERROR: % columnas obsoletas aún en negociaciones', v_negociaciones_columnas;
  ELSE
    RAISE NOTICE '   └─ ✅ Columnas obsoletas eliminadas de negociaciones';
  END IF;

  -- Verificar columnas eliminadas de viviendas
  SELECT COUNT(*) INTO v_viviendas_columnas
  FROM information_schema.columns
  WHERE table_name = 'viviendas'
    AND column_name IN ('precio', 'fecha_pago_completo');

  IF v_viviendas_columnas > 0 THEN
    RAISE NOTICE '   └─ ❌ ERROR: % columnas obsoletas aún en viviendas', v_viviendas_columnas;
  ELSE
    RAISE NOTICE '   └─ ✅ Columnas obsoletas eliminadas de viviendas';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';

  IF NOT v_tabla_abonos_existe AND v_negociaciones_columnas = 0 AND v_viviendas_columnas = 0 THEN
    RAISE NOTICE '║  ✅✅✅ LIMPIEZA COMPLETADA EXITOSAMENTE ✅✅✅          ║';
    RAISE NOTICE '║                                                           ║';
    RAISE NOTICE '║  Elementos eliminados:                                    ║';
    RAISE NOTICE '║  • 1 tabla completa (abonos)                             ║';
    RAISE NOTICE '║  • 4 columnas de negociaciones                           ║';
    RAISE NOTICE '║  • 2 columnas de viviendas                               ║';
    RAISE NOTICE '║                                                           ║';
    RAISE NOTICE '║  Total: 7 elementos obsoletos eliminados                 ║';
  ELSE
    RAISE NOTICE '║  ⚠️  LIMPIEZA CON ADVERTENCIAS ⚠️                        ║';
    RAISE NOTICE '║                                                           ║';
    RAISE NOTICE '║  Revisa los mensajes anteriores                          ║';
  END IF;

  RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- COMMIT DE CAMBIOS
-- ============================================================================

COMMIT;

DO $$
BEGIN
  RAISE NOTICE '✅ Transacción confirmada - Cambios aplicados permanentemente';
  RAISE NOTICE '';
  RAISE NOTICE '📝 SIGUIENTES PASOS:';
  RAISE NOTICE '   1. Actualizar DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md';
  RAISE NOTICE '   2. Probar todas las funcionalidades';
  RAISE NOTICE '   3. Verificar que no haya errores en la aplicación';
  RAISE NOTICE '';
END $$;
