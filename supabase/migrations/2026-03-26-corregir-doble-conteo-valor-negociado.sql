-- =====================================================
-- MIGRACIÓN: Corregir doble conteo en valor_negociado
-- Fecha: 2026-03-26
--
-- PROBLEMA:
--   useProyectosViviendas.ts auto-rellenaba valor_negociado = vivienda.valor_total
--   (que ya incluye gastos_notariales + recargo_esquinera).
--   El trigger calcular_valor_total_pagar sumaba esos extras OTRA VEZ:
--     valor_total_pagar = valor_total + gastos + recargo → DOBLE CONTEO ❌
--
-- EJEMPLO (negociación Cesar Ivan Arana Benitez):
--   valor_base               = $108.600.000 (precio de la casa)
--   gastos_notariales        = $5.000.000
--   recargo_esquinera        = $5.000.000
--   vivienda.valor_total     = $118.600.000 ← se guardó como valor_negociado (ERROR)
--   trigger suma extras      = +$10.000.000
--   valor_total_pagar        = $128.600.000 ❌ (debía ser $118.600.000)
--
-- SOLUCIÓN:
--   1. Identificar negociaciones donde valor_negociado = vivienda.valor_total
--      Y vivienda tiene extras (valor_base < valor_total)
--   2. Corregir: valor_negociado = vivienda.valor_base
--   3. El trigger BEFORE UPDATE recalcula valor_total_pagar automáticamente
--   4. Recalcular saldo_pendiente y porcentaje_pagado
--
-- CÓDIGO CORREGIDO: useProyectosViviendas.ts ahora usa vivienda.valor_base
-- =====================================================

-- ─────────────────────────────────────────────────────
-- PASO 0: Diagnóstico — Ver negociaciones afectadas
-- ─────────────────────────────────────────────────────
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT n.id) INTO v_count
  FROM public.negociaciones n
  JOIN public.viviendas v ON n.vivienda_id = v.id
  WHERE v.valor_base > 0
    AND v.valor_base < v.valor_total              -- vivienda tiene extras
    AND n.valor_negociado = v.valor_total          -- fue guardado con valor incorrecto
    AND n.descuento_aplicado = 0                   -- sin descuento (para identificación limpia)
    AND n.estado != 'Cerrada por Renuncia';

  RAISE NOTICE '📊 Negociaciones afectadas por doble conteo: %', v_count;
END $$;

-- ─────────────────────────────────────────────────────
-- PASO 1: Mostrar detalle de negociaciones a corregir
-- ─────────────────────────────────────────────────────
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '--- Negociaciones a corregir ---';
  FOR rec IN
    SELECT
      n.id,
      n.estado,
      n.valor_negociado AS valor_negociado_actual,
      v.valor_base AS valor_negociado_correcto,
      n.valor_total_pagar AS valor_total_pagar_actual,
      (v.valor_base + COALESCE(v.gastos_notariales, 0) +
        CASE WHEN COALESCE(v.es_esquinera, false) THEN COALESCE(v.recargo_esquinera, 0) ELSE 0 END
      ) AS valor_total_pagar_correcto,
      v.gastos_notariales,
      v.recargo_esquinera,
      v.es_esquinera
    FROM public.negociaciones n
    JOIN public.viviendas v ON n.vivienda_id = v.id
    WHERE v.valor_base > 0
      AND v.valor_base < v.valor_total
      AND n.valor_negociado = v.valor_total
      AND n.descuento_aplicado = 0
      AND n.estado != 'Cerrada por Renuncia'
  LOOP
    RAISE NOTICE 'ID=%, estado=%, valor_negociado_actual=%, correcto=%, total_pagar_actual=%, correcto=%',
      rec.id, rec.estado, rec.valor_negociado_actual, rec.valor_negociado_correcto,
      rec.valor_total_pagar_actual, rec.valor_total_pagar_correcto;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────
-- PASO 2: Corregir valor_negociado → valor_base
-- El trigger BEFORE UPDATE (trigger_calcular_valor_total_pagar_update) se dispara
-- automáticamente y recalcula valor_total_pagar con la fórmula correcta.
-- ─────────────────────────────────────────────────────
UPDATE public.negociaciones n
SET valor_negociado = v.valor_base
FROM public.viviendas v
WHERE n.vivienda_id = v.id
  AND v.valor_base > 0
  AND v.valor_base < v.valor_total              -- vivienda tiene gastos/recargos reales
  AND n.valor_negociado = v.valor_total          -- fue guardado erróneamente con valor_total
  AND n.descuento_aplicado = 0                   -- sin descuento personalizado
  AND n.estado != 'Cerrada por Renuncia';        -- no tocar renuncias históricas

-- ─────────────────────────────────────────────────────
-- PASO 3: Recalcular saldo_pendiente y porcentaje_pagado
-- después de que valor_total_pagar fue ajustado por el trigger
-- ─────────────────────────────────────────────────────
UPDATE public.negociaciones n
SET
  saldo_pendiente = n.valor_total_pagar - COALESCE(n.total_abonado, 0),
  porcentaje_pagado = CASE
    WHEN n.valor_total_pagar > 0
      THEN LEAST((COALESCE(n.total_abonado, 0) / n.valor_total_pagar) * 100, 100)
    ELSE 0
  END
FROM public.viviendas v
WHERE n.vivienda_id = v.id
  AND v.valor_base > 0
  AND v.valor_base < v.valor_total
  AND n.valor_negociado = v.valor_base           -- ya fue corregido en PASO 2
  AND n.estado != 'Cerrada por Renuncia';

-- ─────────────────────────────────────────────────────
-- PASO 4: Verificación final
-- ─────────────────────────────────────────────────────
DO $$
DECLARE
  rec RECORD;
  v_count INTEGER := 0;
BEGIN
  RAISE NOTICE '--- Verificación después de corrección ---';

  FOR rec IN
    SELECT
      n.id,
      n.estado,
      n.valor_negociado,
      n.valor_total_pagar,
      n.saldo_pendiente,
      n.total_abonado,
      n.porcentaje_pagado,
      v.valor_total AS vivienda_valor_total
    FROM public.negociaciones n
    JOIN public.viviendas v ON n.vivienda_id = v.id
    WHERE v.valor_base > 0
      AND v.valor_base < v.valor_total
      AND n.valor_negociado = v.valor_base
      AND n.estado != 'Cerrada por Renuncia'
    ORDER BY n.fecha_negociacion DESC
    LIMIT 20
  LOOP
    RAISE NOTICE '✅ ID=%, valor_negociado=%, valor_total_pagar=%, vivienda_valor_total=%, saldo=%',
      rec.id, rec.valor_negociado, rec.valor_total_pagar, rec.vivienda_valor_total, rec.saldo_pendiente;
    v_count := v_count + 1;
  END LOOP;

  RAISE NOTICE '✅ Migración completada: % negociaciones corregidas', v_count;
END $$;

-- ─────────────────────────────────────────────────────
-- NOTA IMPORTANTE sobre negociaciones con descuento personalizado
-- ─────────────────────────────────────────────────────
-- Las negociaciones con descuento_aplicado > 0 NO se corrigen automáticamente
-- porque el valor_negociado podría ser intencional (precio negociado especial).
-- Si hay casos con descuento que también tienen doble conteo, corregirlos manualmente:
--
-- UPDATE negociaciones n
-- SET valor_negociado = v.valor_base
-- FROM viviendas v
-- WHERE n.id = '<ID_ESPECIFICO>'
--   AND n.vivienda_id = v.id;
-- ─────────────────────────────────────────────────────
