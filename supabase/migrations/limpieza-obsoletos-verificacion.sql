-- ============================================================================
-- VERIFICACIÓN PRE-LIMPIEZA - Base de Datos RyR Constructora
-- Fecha: 2025-10-22
-- Propósito: Verificar que sea seguro eliminar elementos obsoletos
-- ============================================================================

DO $$
DECLARE
  v_abonos_count INT;
  v_neg_cierre_financiero INT;
  v_neg_activacion INT;
  v_neg_cancelacion INT;
  v_neg_motivo INT;
  v_viv_precio_diff INT;
  v_viv_fecha_pago INT;
  v_es_seguro BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  🔍 VERIFICACIÓN DE ELEMENTOS OBSOLETOS                  ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';

  -- ========================================================================
  -- 1. VERIFICAR TABLA abonos
  -- ========================================================================
  SELECT COUNT(*) INTO v_abonos_count FROM abonos;

  RAISE NOTICE '1️⃣  TABLA abonos:';
  RAISE NOTICE '   └─ Registros encontrados: %', v_abonos_count;

  IF v_abonos_count > 0 THEN
    RAISE NOTICE '   └─ ❌ NO SEGURO - Hay datos en la tabla';
    v_es_seguro := FALSE;
  ELSE
    RAISE NOTICE '   └─ ✅ SEGURO - Tabla vacía';
  END IF;
  RAISE NOTICE '';

  -- ========================================================================
  -- 2. VERIFICAR COLUMNAS OBSOLETAS EN negociaciones
  -- ========================================================================
  RAISE NOTICE '2️⃣  TABLA negociaciones - Columnas obsoletas:';

  -- fecha_cierre_financiero
  SELECT COUNT(*) INTO v_neg_cierre_financiero
  FROM negociaciones
  WHERE fecha_cierre_financiero IS NOT NULL;

  RAISE NOTICE '   └─ fecha_cierre_financiero: % registros con datos', v_neg_cierre_financiero;
  IF v_neg_cierre_financiero > 0 THEN
    RAISE NOTICE '      └─ ❌ NO SEGURO - Hay datos';
    v_es_seguro := FALSE;
  ELSE
    RAISE NOTICE '      └─ ✅ SEGURO - Todos en NULL';
  END IF;

  -- fecha_activacion
  SELECT COUNT(*) INTO v_neg_activacion
  FROM negociaciones
  WHERE fecha_activacion IS NOT NULL;

  RAISE NOTICE '   └─ fecha_activacion: % registros con datos', v_neg_activacion;
  IF v_neg_activacion > 0 THEN
    RAISE NOTICE '      └─ ❌ NO SEGURO - Hay datos';
    v_es_seguro := FALSE;
  ELSE
    RAISE NOTICE '      └─ ✅ SEGURO - Todos en NULL';
  END IF;

  -- fecha_cancelacion
  SELECT COUNT(*) INTO v_neg_cancelacion
  FROM negociaciones
  WHERE fecha_cancelacion IS NOT NULL;

  RAISE NOTICE '   └─ fecha_cancelacion: % registros con datos', v_neg_cancelacion;
  IF v_neg_cancelacion > 0 THEN
    RAISE NOTICE '      └─ ❌ NO SEGURO - Hay datos';
    v_es_seguro := FALSE;
  ELSE
    RAISE NOTICE '      └─ ✅ SEGURO - Todos en NULL';
  END IF;

  -- motivo_cancelacion
  SELECT COUNT(*) INTO v_neg_motivo
  FROM negociaciones
  WHERE motivo_cancelacion IS NOT NULL;

  RAISE NOTICE '   └─ motivo_cancelacion: % registros con datos', v_neg_motivo;
  IF v_neg_motivo > 0 THEN
    RAISE NOTICE '      └─ ❌ NO SEGURO - Hay datos';
    v_es_seguro := FALSE;
  ELSE
    RAISE NOTICE '      └─ ✅ SEGURO - Todos en NULL';
  END IF;
  RAISE NOTICE '';

  -- ========================================================================
  -- 3. VERIFICAR COLUMNAS OBSOLETAS EN viviendas
  -- ========================================================================
  RAISE NOTICE '3️⃣  TABLA viviendas - Columnas obsoletas:';

  -- precio diferente de valor_base
  SELECT COUNT(*) INTO v_viv_precio_diff
  FROM viviendas
  WHERE precio IS NOT NULL AND precio != valor_base;

  RAISE NOTICE '   └─ precio (diferente de valor_base): % registros', v_viv_precio_diff;
  IF v_viv_precio_diff > 0 THEN
    RAISE NOTICE '      └─ ⚠️  ADVERTENCIA - Hay discrepancias';
    -- No bloqueamos porque precio se puede migrar a valor_base
  ELSE
    RAISE NOTICE '      └─ ✅ SEGURO - precio = valor_base';
  END IF;

  -- fecha_pago_completo
  SELECT COUNT(*) INTO v_viv_fecha_pago
  FROM viviendas
  WHERE fecha_pago_completo IS NOT NULL;

  RAISE NOTICE '   └─ fecha_pago_completo: % registros con datos', v_viv_fecha_pago;
  IF v_viv_fecha_pago > 0 THEN
    RAISE NOTICE '      └─ ❌ NO SEGURO - Hay datos';
    v_es_seguro := FALSE;
  ELSE
    RAISE NOTICE '      └─ ✅ SEGURO - Todos en NULL';
  END IF;
  RAISE NOTICE '';

  -- ========================================================================
  -- RESULTADO FINAL
  -- ========================================================================
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════╗';
  IF v_es_seguro THEN
    RAISE NOTICE '║  ✅✅✅ VERIFICACIÓN EXITOSA ✅✅✅                      ║';
    RAISE NOTICE '║                                                           ║';
    RAISE NOTICE '║  Es SEGURO proceder con la limpieza                      ║';
    RAISE NOTICE '║  Ejecuta: limpieza-obsoletos-ejecucion.sql               ║';
  ELSE
    RAISE NOTICE '║  ❌❌❌ VERIFICACIÓN FALLIDA ❌❌❌                      ║';
    RAISE NOTICE '║                                                           ║';
    RAISE NOTICE '║  NO ES SEGURO eliminar - Hay datos en uso                ║';
    RAISE NOTICE '║  Revisa los mensajes anteriores                          ║';
  END IF;
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';

END $$;
