-- =====================================================
-- MIGRACIÓN: valor_total_pagar — Single source of truth
-- Fecha: 2026-03-21
--
-- PROBLEMA:
--   negociaciones.valor_total = valor_negociado - descuento (GENERATED)
--   viviendas.valor_total   = valor_base + gastos + recargo  (GENERATED)
--   El cliente DEBE PAGAR valor_base - descuento + gastos + recargo,
--   pero saldo_pendiente y porcentaje_pagado usaban negociaciones.valor_total
--   → mostraban $108.6M cuando debían mostrar $118.6M.
--
-- SOLUCIÓN:
--   1. Nueva columna: negociaciones.valor_total_pagar (obligación real)
--   2. Trigger BEFORE INSERT/UPDATE en negociaciones: auto-calcula desde vivienda
--   3. Trigger AFTER UPDATE en viviendas: propaga cambios a negociaciones vinculadas
--   4. update_negociaciones_totales() usa valor_total_pagar para saldo/porcentaje
--   5. Backfill datos existentes
-- =====================================================

-- ─────────────────────────────────────────────────────
-- PASO 1: Agregar columna
-- ─────────────────────────────────────────────────────
ALTER TABLE public.negociaciones
  ADD COLUMN IF NOT EXISTS valor_total_pagar DECIMAL(15,2) DEFAULT 0;

COMMENT ON COLUMN public.negociaciones.valor_total_pagar IS
  'Obligación total del cliente = (valor_negociado - descuento) + gastos_notariales + recargo_esquinera. Se auto-calcula desde vivienda vinculada.';

-- ─────────────────────────────────────────────────────
-- PASO 2: Trigger — auto-calcular valor_total_pagar
-- Fires BEFORE INSERT/UPDATE on negociaciones
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calcular_valor_total_pagar()
RETURNS TRIGGER AS $$
DECLARE
  v_gastos BIGINT := 0;
  v_recargo BIGINT := 0;
  v_es_esquinera BOOLEAN := false;
  v_valor_neto DECIMAL(15,2);
BEGIN
  -- Obtener gastos y recargos de la vivienda vinculada
  SELECT
    COALESCE(v.gastos_notariales, 0),
    COALESCE(v.recargo_esquinera, 0),
    COALESCE(v.es_esquinera, false)
  INTO v_gastos, v_recargo, v_es_esquinera
  FROM public.viviendas v
  WHERE v.id = NEW.vivienda_id;

  -- Calcular neto negociado
  v_valor_neto := COALESCE(NEW.valor_negociado, 0) - COALESCE(NEW.descuento_aplicado, 0);

  -- Solo sumar recargo si la vivienda es esquinera
  IF v_es_esquinera THEN
    NEW.valor_total_pagar := v_valor_neto + v_gastos + v_recargo;
  ELSE
    NEW.valor_total_pagar := v_valor_neto + v_gastos;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger BEFORE INSERT
DROP TRIGGER IF EXISTS trigger_calcular_valor_total_pagar_insert ON public.negociaciones;
CREATE TRIGGER trigger_calcular_valor_total_pagar_insert
  BEFORE INSERT ON public.negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_total_pagar();

-- Trigger BEFORE UPDATE (cuando cambien valor_negociado, descuento o vivienda)
DROP TRIGGER IF EXISTS trigger_calcular_valor_total_pagar_update ON public.negociaciones;
CREATE TRIGGER trigger_calcular_valor_total_pagar_update
  BEFORE UPDATE OF valor_negociado, descuento_aplicado, vivienda_id ON public.negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_total_pagar();

-- ─────────────────────────────────────────────────────
-- PASO 3: Trigger — propagar cambios de vivienda
-- Si cambian gastos/recargos en vivienda, actualizar negociaciones
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION propagar_cambio_vivienda_a_negociaciones()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actuar si cambiaron los valores financieros relevantes
  IF OLD.gastos_notariales IS DISTINCT FROM NEW.gastos_notariales
    OR OLD.recargo_esquinera IS DISTINCT FROM NEW.recargo_esquinera
    OR OLD.es_esquinera IS DISTINCT FROM NEW.es_esquinera
    OR OLD.valor_base IS DISTINCT FROM NEW.valor_base
  THEN
    -- Actualizar valor_total_pagar en todas las negociaciones activas vinculadas
    UPDATE public.negociaciones n
    SET valor_total_pagar = (n.valor_negociado - COALESCE(n.descuento_aplicado, 0))
      + COALESCE(NEW.gastos_notariales, 0)
      + CASE WHEN COALESCE(NEW.es_esquinera, false) THEN COALESCE(NEW.recargo_esquinera, 0) ELSE 0 END
    WHERE n.vivienda_id = NEW.id
      AND n.estado IN ('En Proceso', 'Cierre Financiero', 'Activa');

    -- Recalcular saldo y porcentaje para las negociaciones afectadas
    UPDATE public.negociaciones n
    SET
      saldo_pendiente = n.valor_total_pagar - COALESCE(n.total_abonado, 0),
      porcentaje_pagado = CASE
        WHEN n.valor_total_pagar > 0 THEN LEAST((COALESCE(n.total_abonado, 0) / n.valor_total_pagar) * 100, 100)
        ELSE 0
      END
    WHERE n.vivienda_id = NEW.id
      AND n.estado IN ('En Proceso', 'Cierre Financiero', 'Activa');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_propagar_vivienda_a_negociaciones ON public.viviendas;
CREATE TRIGGER trigger_propagar_vivienda_a_negociaciones
  AFTER UPDATE ON public.viviendas
  FOR EACH ROW
  EXECUTE FUNCTION propagar_cambio_vivienda_a_negociaciones();

-- ─────────────────────────────────────────────────────
-- PASO 4: Actualizar trigger update_negociaciones_totales
-- Usar valor_total_pagar en vez de valor_total para saldo/porcentaje
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_negociaciones_totales()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.negociaciones
  SET
    -- Suma capital_para_cierre para créditos, monto_aprobado para otras fuentes
    total_fuentes_pago = (
      SELECT COALESCE(SUM(COALESCE(capital_para_cierre, monto_aprobado)), 0)
      FROM public.fuentes_pago
      WHERE negociacion_id = COALESCE(NEW.negociacion_id, OLD.negociacion_id)
        AND estado = 'Activa'
    ),
    -- Total cobrado: capear créditos constructora a capital_para_cierre
    total_abonado = (
      SELECT COALESCE(SUM(
        LEAST(
          monto_recibido,
          COALESCE(capital_para_cierre, monto_aprobado)
        )
      ), 0)
      FROM public.fuentes_pago
      WHERE negociacion_id = COALESCE(NEW.negociacion_id, OLD.negociacion_id)
    )
  WHERE id = COALESCE(NEW.negociacion_id, OLD.negociacion_id);

  -- ✅ Usar valor_total_pagar (obligación real) en vez de valor_total
  UPDATE public.negociaciones
  SET
    saldo_pendiente = valor_total_pagar - total_abonado,
    porcentaje_pagado = CASE
      WHEN valor_total_pagar > 0 THEN LEAST((total_abonado / valor_total_pagar) * 100, 100)
      ELSE 0
    END
  WHERE id = COALESCE(NEW.negociacion_id, OLD.negociacion_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────
-- PASO 5: Backfill — calcular valor_total_pagar para datos existentes
-- ─────────────────────────────────────────────────────
UPDATE public.negociaciones n
SET valor_total_pagar = (n.valor_negociado - COALESCE(n.descuento_aplicado, 0))
  + COALESCE(v.gastos_notariales, 0)
  + CASE WHEN COALESCE(v.es_esquinera, false) THEN COALESCE(v.recargo_esquinera, 0) ELSE 0 END
FROM public.viviendas v
WHERE n.vivienda_id = v.id;

-- Recalcular saldo y porcentaje con el valor correcto
UPDATE public.negociaciones n
SET
  saldo_pendiente = n.valor_total_pagar - COALESCE(n.total_abonado, 0),
  porcentaje_pagado = CASE
    WHEN n.valor_total_pagar > 0 THEN LEAST((COALESCE(n.total_abonado, 0) / n.valor_total_pagar) * 100, 100)
    ELSE 0
  END
WHERE n.valor_total_pagar > 0;

-- ─────────────────────────────────────────────────────
-- VERIFICACIÓN
-- ─────────────────────────────────────────────────────
DO $$
DECLARE
  v_count INTEGER;
  v_sample RECORD;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.negociaciones
  WHERE valor_total_pagar > 0 AND valor_total_pagar <> valor_total;

  RAISE NOTICE '✅ Migración completada: % negociaciones con valor_total_pagar ≠ valor_total (incluyen gastos/recargos)', v_count;

  -- Mostrar un ejemplo
  SELECT n.id, n.valor_total, n.valor_total_pagar, n.saldo_pendiente, n.porcentaje_pagado
  INTO v_sample
  FROM public.negociaciones n
  WHERE n.valor_total_pagar > 0
  LIMIT 1;

  IF FOUND THEN
    RAISE NOTICE 'Ejemplo: id=%, valor_total=%, valor_total_pagar=%, saldo=%, porcentaje=%',
      v_sample.id, v_sample.valor_total, v_sample.valor_total_pagar,
      v_sample.saldo_pendiente, v_sample.porcentaje_pagado;
  END IF;
END $$;
