-- Patch: Fix trigger para columnas GENERATED
-- saldo_pendiente y porcentaje_completado en fuentes_pago son GENERATED ALWAYS
-- Solo se puede actualizar monto_recibido; las demás se calculan solas.

CREATE OR REPLACE FUNCTION fn_recalcular_saldos_tras_anulacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_nuevo_monto_recibido  NUMERIC;
  v_nuevo_total_abonado   NUMERIC;
  v_valor_total_pagar     NUMERIC;
BEGIN
  -- Paso 1: Recalcular fuente_pago (solo monto_recibido — las columnas generadas se actualizan solas)
  SELECT COALESCE(SUM(monto), 0)
    INTO v_nuevo_monto_recibido
    FROM abonos_historial
   WHERE fuente_pago_id = NEW.fuente_pago_id
     AND estado = 'Activo';

  UPDATE fuentes_pago
     SET monto_recibido      = v_nuevo_monto_recibido,
         fecha_actualizacion = NOW()
   WHERE id = NEW.fuente_pago_id;

  -- Paso 2: Recalcular negociación (saldo_pendiente, total_abonado, porcentaje_pagado NO son generadas)
  SELECT COALESCE(SUM(ah.monto), 0)
    INTO v_nuevo_total_abonado
    FROM abonos_historial ah
    JOIN fuentes_pago fp ON fp.id = ah.fuente_pago_id
   WHERE fp.negociacion_id = NEW.negociacion_id
     AND ah.estado = 'Activo';

  SELECT valor_total_pagar
    INTO v_valor_total_pagar
    FROM negociaciones
   WHERE id = NEW.negociacion_id;

  UPDATE negociaciones
     SET total_abonado       = v_nuevo_total_abonado,
         saldo_pendiente     = GREATEST(COALESCE(v_valor_total_pagar, 0) - v_nuevo_total_abonado, 0),
         porcentaje_pagado   = CASE
           WHEN COALESCE(v_valor_total_pagar, 0) > 0
           THEN ROUND((v_nuevo_total_abonado / v_valor_total_pagar) * 100, 2)
           ELSE 0
         END,
         fecha_actualizacion = NOW()
   WHERE id = NEW.negociacion_id;

  RETURN NEW;
END;
$$;
