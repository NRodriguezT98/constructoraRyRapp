-- ============================================================
-- Patch 023c: Opción A — Parchear trigger existente + eliminar redundante
-- ============================================================
--
-- 1. Actualiza actualizar_monto_recibido_fuente() para filtrar estado='Activo'
-- 2. Elimina el trigger redundante trg_recalcular_saldos_anulacion
-- 3. Elimina la función redundante fn_recalcular_saldos_tras_anulacion
--
-- La cadena existente se encarga de todo:
--   abono UPDATE → actualizar_monto_recibido_fuente → fuentes_pago.monto_recibido
--                   (saldo_pendiente y porcentaje_completado son GENERATED)
--                   → trigger_update_negociaciones_totales → negociaciones.*
-- ============================================================

-- 1. Parchear función existente: agregar AND estado = 'Activo'
CREATE OR REPLACE FUNCTION actualizar_monto_recibido_fuente()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  fuente_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    fuente_id := OLD.fuente_pago_id;
  ELSE
    fuente_id := NEW.fuente_pago_id;
  END IF;

  UPDATE public.fuentes_pago
  SET
    -- Solo capital+intereses: excluir mora para no violar límite monto_aprobado
    monto_recibido = (
      SELECT COALESCE(SUM(monto - COALESCE(mora_incluida, 0)), 0)
      FROM public.abonos_historial
      WHERE fuente_pago_id = fuente_id
        AND estado = 'Activo'                  -- ← NUEVO: excluir anulados
    ),
    -- Mora se acumula por separado para reporte
    mora_total_recibida = (
      SELECT COALESCE(SUM(COALESCE(mora_incluida, 0)), 0)
      FROM public.abonos_historial
      WHERE fuente_pago_id = fuente_id
        AND estado = 'Activo'                  -- ← NUEVO: excluir anulados
    )
  WHERE id = fuente_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 2. Eliminar trigger redundante
DROP TRIGGER IF EXISTS trg_recalcular_saldos_anulacion ON abonos_historial;

-- 3. Eliminar función redundante
DROP FUNCTION IF EXISTS fn_recalcular_saldos_tras_anulacion();
