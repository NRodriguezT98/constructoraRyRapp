-- =====================================================
-- Fix: update_negociaciones_totales — total_abonado with credit cap
-- Date: 2026-03-18
-- Problem:
--   When a "Crédito con la Constructora" fuente has monto_aprobado = capital + intereses
--   (e.g. $14.84M) but capital_para_cierre = capital only (e.g. $14M),
--   the old trigger summed ALL monto_recibido including interest.
--   Result: total_abonado ($122.84M) > valor_total ($122M) → saldo_pendiente goes negative.
-- Fix:
--   Cap each fuente's contribution to total_abonado at COALESCE(capital_para_cierre, monto_aprobado).
--   This means interest payments above the capital are real payments but don't inflate
--   the "progress toward vivienda price" metric.
-- =====================================================

CREATE OR REPLACE FUNCTION update_negociaciones_totales()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.negociaciones
  SET
    -- Suma capital_para_cierre cuando existe (créditos), monto_aprobado para otras fuentes
    total_fuentes_pago = (
      SELECT COALESCE(SUM(COALESCE(capital_para_cierre, monto_aprobado)), 0)
      FROM public.fuentes_pago
      WHERE negociacion_id = COALESCE(NEW.negociacion_id, OLD.negociacion_id)
        AND estado = 'Activa'
    ),
    -- Total cobrado: para créditos con la constructora, capear en capital_para_cierre
    -- para que el monto de intereses no infle el "total abonado" por encima de valor_total
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

  UPDATE public.negociaciones
  SET
    saldo_pendiente = valor_total - total_abonado,
    porcentaje_pagado = CASE
      WHEN valor_total > 0 THEN LEAST((total_abonado / valor_total) * 100, 100)
      ELSE 0
    END
  WHERE id = COALESCE(NEW.negociacion_id, OLD.negociacion_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
