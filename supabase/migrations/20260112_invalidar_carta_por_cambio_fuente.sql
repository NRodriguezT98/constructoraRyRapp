-- =========================================================
-- TRIGGER: Invalidar carta de aprobación cuando cambia
-- la entidad financiera o aumenta el monto aprobado
--
-- REGLA DE NEGOCIO:
--   Cuando el plan financiero se rebalanza y una fuente:
--     - Cambia de entidad (banco, caja), O
--     - Aumenta su monto aprobado
--   La carta de aprobación vigente ya NO es válida porque
--   corresponde a condiciones anteriores. Se debe adjuntar
--   una nueva carta emitida por la entidad con los nuevos
--   términos.
--
-- NOTA: Si el monto DISMINUYE (ej: corrección a la baja)
--   la carta anterior sigue siendo válida, por eso solo
--   invalidamos cuando monto_aprobado SUBE.
--
-- NOTA: Fuentes inactivas no generan esta invalidación
--   porque ya no participan en el plan financiero activo.
-- =========================================================

-- ── FUNCIÓN ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_invalidar_carta_por_cambio()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Solo actuar si la fuente sigue activa
  IF NEW.estado_fuente = 'inactiva' THEN
    RETURN NEW;
  END IF;

  -- Cuota Inicial nunca requiere carta, ignorar
  IF NEW.tipo = 'Cuota Inicial' THEN
    RETURN NEW;
  END IF;

  -- Verificar si hay un cambio que invalida la carta
  IF (
    -- La entidad cambió
    (OLD.entidad IS DISTINCT FROM NEW.entidad)
    OR
    -- El monto aprobado aumentó (no disminuyó)
    (NEW.monto_aprobado > OLD.monto_aprobado)
  ) THEN
    -- Anular carta solo si tenía una
    IF OLD.carta_aprobacion_url IS NOT NULL THEN
      NEW.carta_aprobacion_url = NULL;

      -- Opcional: registrar en pglog para trazabilidad
      RAISE NOTICE 'Carta invalidada para fuente % (tipo: %, motivo: %)',
        NEW.id,
        NEW.tipo,
        CASE
          WHEN OLD.entidad IS DISTINCT FROM NEW.entidad THEN 'cambio_entidad'
          ELSE 'aumento_monto'
        END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ── TRIGGER ──────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_invalidar_carta_por_cambio ON fuentes_pago;

CREATE TRIGGER trg_invalidar_carta_por_cambio
BEFORE UPDATE ON fuentes_pago
FOR EACH ROW
EXECUTE FUNCTION fn_invalidar_carta_por_cambio();

-- ── VERIFICACIÓN ─────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_invalidar_carta_por_cambio'
  ) THEN
    RAISE NOTICE '✅ Trigger trg_invalidar_carta_por_cambio creado correctamente';
  ELSE
    RAISE WARNING '❌ No se pudo crear trg_invalidar_carta_por_cambio';
  END IF;
END;
$$;
