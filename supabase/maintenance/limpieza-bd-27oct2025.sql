-- =====================================================
-- SCRIPT DE LIMPIEZA BASE DE DATOS
-- =====================================================
-- Fecha: 2025-10-27
-- Descripción: Eliminar elementos obsoletos identificados en análisis
-- Referencia: docs/ANALISIS-LIMPIEZA-BASE-DATOS.md
-- =====================================================

-- =====================================================
-- PARTE 1: LIMPIEZA SEGURA (SAFE TO RUN)
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🧹 INICIANDO LIMPIEZA DE BASE DE DATOS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- 1️⃣ ELIMINAR TABLA BACKUP OBSOLETA
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '📋 Verificando tabla backup...';

  -- Verificar si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'categorias_documento_backup_20251017'
  ) THEN
    RAISE NOTICE '✅ Tabla backup encontrada - Procediendo a eliminar';

    -- Eliminar tabla
    DROP TABLE IF EXISTS categorias_documento_backup_20251017 CASCADE;

    RAISE NOTICE '✅ Tabla categorias_documento_backup_20251017 eliminada';
  ELSE
    RAISE NOTICE '⚠️  Tabla backup no existe (ya fue eliminada)';
  END IF;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- PARTE 2: VERIFICACIONES PRE-ELIMINACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 VERIFICACIONES DE SEGURIDAD';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- 2️⃣ VERIFICAR CAMPO REDUNDANTE: renuncias.cliente_id
-- =====================================================

DO $$
DECLARE
  v_total_renuncias INTEGER;
  v_sin_negociacion INTEGER;
  v_con_cliente_directo INTEGER;
BEGIN
  RAISE NOTICE '📊 Analizando campo renuncias.cliente_id...';
  RAISE NOTICE '';

  -- Contar total de renuncias
  SELECT COUNT(*) INTO v_total_renuncias FROM renuncias;
  RAISE NOTICE '   Total renuncias: %', v_total_renuncias;

  -- Contar renuncias SIN negociacion_id (problema)
  SELECT COUNT(*) INTO v_sin_negociacion
  FROM renuncias
  WHERE negociacion_id IS NULL;
  RAISE NOTICE '   Sin negociacion_id: % (⚠️  BLOQUEA ELIMINACIÓN)', v_sin_negociacion;

  -- Contar renuncias CON cliente_id directo
  SELECT COUNT(*) INTO v_con_cliente_directo
  FROM renuncias
  WHERE cliente_id IS NOT NULL;
  RAISE NOTICE '   Con cliente_id directo: %', v_con_cliente_directo;

  RAISE NOTICE '';

  -- Validar si es seguro eliminar
  IF v_sin_negociacion = 0 THEN
    RAISE NOTICE '✅ SEGURO ELIMINAR: Todas las renuncias tienen negociacion_id';
    RAISE NOTICE '   El cliente se puede obtener vía negociaciones.cliente_id';
  ELSE
    RAISE NOTICE '❌ NO SEGURO: Hay % renuncias sin negociacion_id', v_sin_negociacion;
    RAISE NOTICE '   Acción requerida: Asignar negociacion_id antes de eliminar campo';
  END IF;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- 3️⃣ ANÁLISIS DE VISTAS DE RESUMEN
-- =====================================================

DO $$
DECLARE
  v_count_clientes INTEGER;
  v_count_manzanas INTEGER;
BEGIN
  RAISE NOTICE '📊 Analizando uso de vistas de resumen...';
  RAISE NOTICE '';

  -- Verificar vista_clientes_resumen
  BEGIN
    SELECT COUNT(*) INTO v_count_clientes FROM vista_clientes_resumen;
    RAISE NOTICE '   vista_clientes_resumen: % registros', v_count_clientes;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '   vista_clientes_resumen: NO EXISTE';
  END;

  -- Verificar vista_manzanas_disponibilidad
  BEGIN
    SELECT COUNT(*) INTO v_count_manzanas FROM vista_manzanas_disponibilidad;
    RAISE NOTICE '   vista_manzanas_disponibilidad: % registros', v_count_manzanas;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '   vista_manzanas_disponibilidad: NO EXISTE';
  END;

  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Nota: Verificar en código si estas vistas se usan';
  RAISE NOTICE '   Comando: grep -r "vista_clientes_resumen" src/';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- PARTE 3: LIMPIEZA OPCIONAL (COMENTADA)
-- =====================================================

/*
-- =====================================================
-- 🛑 ADVERTENCIA: NO EJECUTAR SIN VALIDACIÓN PREVIA
-- =====================================================
-- Descomentar SOLO después de verificar:
-- 1. Todas las renuncias tienen negociacion_id
-- 2. Ninguna query usa renuncias.cliente_id directamente
-- =====================================================

-- Crear índice para compensar performance
CREATE INDEX IF NOT EXISTS idx_renuncias_negociacion_cliente
ON renuncias(negociacion_id);

-- Eliminar campo redundante
ALTER TABLE renuncias DROP COLUMN IF EXISTS cliente_id;

-- Actualizar comentario
COMMENT ON TABLE renuncias IS
'Registro de renuncias. El cliente se obtiene a través de negociaciones.cliente_id';

RAISE NOTICE '✅ Campo renuncias.cliente_id eliminado';
RAISE NOTICE '✅ Índice de compensación creado';

*/

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ LIMPIEZA COMPLETADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Acciones ejecutadas:';
  RAISE NOTICE '   ✅ Tabla backup eliminada';
  RAISE NOTICE '   ✅ Verificaciones completadas';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Acciones pendientes:';
  RAISE NOTICE '   - Revisar código: grep -r "vista_clientes_resumen" src/';
  RAISE NOTICE '   - Considerar eliminar renuncias.cliente_id (ver verificaciones)';
  RAISE NOTICE '';
  RAISE NOTICE '📄 Documento completo: docs/ANALISIS-LIMPIEZA-BASE-DATOS.md';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- QUERIES DE VALIDACIÓN POST-LIMPIEZA
-- =====================================================

-- Verificar que tabla backup fue eliminada
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Tabla backup eliminada correctamente'
    ELSE '❌ Tabla backup aún existe'
  END as resultado
FROM information_schema.tables
WHERE table_name = 'categorias_documento_backup_20251017';

-- Ver estructura actual de renuncias
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'renuncias'
ORDER BY ordinal_position;

-- =====================================================
-- ✅ EJECUTAR EN SUPABASE DASHBOARD → SQL EDITOR
-- =====================================================
