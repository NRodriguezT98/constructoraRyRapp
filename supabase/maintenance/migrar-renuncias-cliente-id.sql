-- =====================================================
-- MIGRACIÓN: Eliminar campo redundante cliente_id
-- =====================================================
-- Fecha: 2025-10-27
-- Descripción: Migrar renuncias.cliente_id → negociaciones.cliente_id
-- Referencia: docs/ANALISIS-LIMPIEZA-BASE-DATOS.md
-- =====================================================

-- =====================================================
-- PASO 1: DIAGNÓSTICO INICIAL
-- =====================================================

DO $$
DECLARE
  v_total_renuncias INTEGER;
  v_sin_negociacion INTEGER;
  v_con_negociacion INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 DIAGNÓSTICO DE RENUNCIAS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Total de renuncias
  SELECT COUNT(*) INTO v_total_renuncias FROM renuncias;
  RAISE NOTICE '📊 Total renuncias: %', v_total_renuncias;

  -- Renuncias SIN negociacion_id
  SELECT COUNT(*) INTO v_sin_negociacion
  FROM renuncias
  WHERE negociacion_id IS NULL;
  RAISE NOTICE '⚠️  Sin negociacion_id: %', v_sin_negociacion;

  -- Renuncias CON negociacion_id
  SELECT COUNT(*) INTO v_con_negociacion
  FROM renuncias
  WHERE negociacion_id IS NOT NULL;
  RAISE NOTICE '✅ Con negociacion_id: %', v_con_negociacion;

  RAISE NOTICE '';

  IF v_sin_negociacion > 0 THEN
    RAISE NOTICE '⚠️  ADVERTENCIA: Hay renuncias sin negociacion_id';
    RAISE NOTICE '   Necesitan ser reparadas antes de continuar';
  ELSE
    RAISE NOTICE '✅ LISTO: Todas las renuncias tienen negociacion_id';
  END IF;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- PASO 2: REPARAR RENUNCIAS SIN NEGOCIACION_ID
-- =====================================================

DO $$
DECLARE
  v_reparadas INTEGER := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔧 REPARANDO RENUNCIAS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Intentar encontrar negociacion_id por cliente_id + vivienda_id
  UPDATE renuncias r
  SET negociacion_id = (
    SELECT n.id
    FROM negociaciones n
    WHERE n.cliente_id = r.cliente_id
      AND n.vivienda_id = r.vivienda_id
    ORDER BY n.fecha_creacion DESC
    LIMIT 1
  )
  WHERE r.negociacion_id IS NULL;

  GET DIAGNOSTICS v_reparadas = ROW_COUNT;

  RAISE NOTICE '✅ Renuncias reparadas: %', v_reparadas;
  RAISE NOTICE '';
END $$;

-- =====================================================
-- PASO 3: VERIFICAR RENUNCIAS HUÉRFANAS
-- =====================================================

DO $$
DECLARE
  v_huerfanas INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 VERIFICACIÓN POST-REPARACIÓN';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Contar renuncias que aún no tienen negociacion_id
  SELECT COUNT(*) INTO v_huerfanas
  FROM renuncias
  WHERE negociacion_id IS NULL;

  IF v_huerfanas > 0 THEN
    RAISE NOTICE '❌ PROBLEMA: Aún hay % renuncias sin negociacion_id', v_huerfanas;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Estas renuncias requieren revisión manual:';
    RAISE NOTICE '';

    -- Mostrar renuncias problemáticas
    RAISE NOTICE 'Ejecuta esta query para ver detalles:';
    RAISE NOTICE '';
    RAISE NOTICE 'SELECT r.id, r.fecha_renuncia, c.nombre_completo, v.numero';
    RAISE NOTICE 'FROM renuncias r';
    RAISE NOTICE 'JOIN clientes c ON r.cliente_id = c.id';
    RAISE NOTICE 'JOIN viviendas v ON r.vivienda_id = v.id';
    RAISE NOTICE 'WHERE r.negociacion_id IS NULL;';
    RAISE NOTICE '';

    RAISE EXCEPTION 'Detener migración - Hay renuncias huérfanas que requieren atención';
  ELSE
    RAISE NOTICE '✅ PERFECTO: Todas las renuncias tienen negociacion_id';
  END IF;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- PASO 4: VALIDAR CONSISTENCIA
-- =====================================================

DO $$
DECLARE
  v_inconsistencias INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 VALIDAR CONSISTENCIA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Verificar que cliente_id de renuncia coincida con cliente_id de negociación
  SELECT COUNT(*) INTO v_inconsistencias
  FROM renuncias r
  INNER JOIN negociaciones n ON r.negociacion_id = n.id
  WHERE r.cliente_id != n.cliente_id;

  IF v_inconsistencias > 0 THEN
    RAISE NOTICE '❌ INCONSISTENCIAS: % renuncias con cliente_id diferente', v_inconsistencias;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Query para ver inconsistencias:';
    RAISE NOTICE '';
    RAISE NOTICE 'SELECT r.id, r.cliente_id as renuncia_cliente, n.cliente_id as negociacion_cliente';
    RAISE NOTICE 'FROM renuncias r';
    RAISE NOTICE 'JOIN negociaciones n ON r.negociacion_id = n.id';
    RAISE NOTICE 'WHERE r.cliente_id != n.cliente_id;';
    RAISE NOTICE '';

    RAISE EXCEPTION 'Detener migración - Hay inconsistencias de datos';
  ELSE
    RAISE NOTICE '✅ PERFECTO: Todos los cliente_id coinciden';
  END IF;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- PASO 5: HACER NEGOCIACION_ID NOT NULL
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔧 ACTUALIZANDO CONSTRAINT';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Cambiar columna a NOT NULL
  ALTER TABLE renuncias
  ALTER COLUMN negociacion_id SET NOT NULL;

  RAISE NOTICE '✅ negociacion_id ahora es NOT NULL';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- PASO 6: ELIMINAR CAMPO REDUNDANTE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🗑️  ELIMINANDO CAMPO REDUNDANTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Crear índice para compensar performance
  CREATE INDEX IF NOT EXISTS idx_renuncias_negociacion
  ON renuncias(negociacion_id);

  RAISE NOTICE '✅ Índice creado: idx_renuncias_negociacion';

  -- Eliminar columna cliente_id
  ALTER TABLE renuncias DROP COLUMN cliente_id;

  RAISE NOTICE '✅ Campo cliente_id eliminado';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- PASO 7: ACTUALIZAR METADATA
-- =====================================================

-- Actualizar comentario de tabla
COMMENT ON TABLE renuncias IS
'Registro de renuncias de clientes. El cliente se obtiene a través de negociaciones.cliente_id';

-- Actualizar comentario de columna
COMMENT ON COLUMN renuncias.negociacion_id IS
'ID de la negociación asociada. El cliente se obtiene vía negociaciones.cliente_id (NOT NULL)';

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Cambios realizados:';
  RAISE NOTICE '   ✅ Renuncias sin negociacion_id reparadas';
  RAISE NOTICE '   ✅ negociacion_id ahora es NOT NULL';
  RAISE NOTICE '   ✅ cliente_id eliminado (redundante)';
  RAISE NOTICE '   ✅ Índice de compensación creado';
  RAISE NOTICE '   ✅ Comentarios actualizados';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Actualizar código TypeScript';
  RAISE NOTICE '   - Regenerar types: npm run update-types';
  RAISE NOTICE '   - Buscar: grep -r "renuncias.cliente_id" src/';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- VALIDACIÓN FINAL
-- =====================================================

-- Ver estructura nueva de renuncias (sin cliente_id)
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
