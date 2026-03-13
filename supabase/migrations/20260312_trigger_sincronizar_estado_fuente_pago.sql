-- ============================================================
-- TRIGGER: Mantener estado y estado_fuente siempre sincronizados
-- ============================================================
--
-- Problema: fuentes_pago tiene DOS columnas para el estado:
--   - estado       → 'Activa'  | 'Inactiva'  (capitalizado)
--   - estado_fuente → 'activa' | 'inactiva' | 'reemplazada' (lowercase)
--
-- Históricamente el código solo actualizaba una de las dos,
-- causando inconsistencias que rompían la vista de pendientes.
--
-- Este trigger sincroniza BEFORE INSERT OR UPDATE para que
-- ambas siempre sean coherentes entre sí.
--
-- Fecha: 2026-03-12
-- ============================================================

CREATE OR REPLACE FUNCTION sincronizar_estado_fuente_pago()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se actualiza estado_fuente → derivar estado
  IF TG_OP = 'UPDATE' AND NEW.estado_fuente IS DISTINCT FROM OLD.estado_fuente THEN
    IF NEW.estado_fuente IN ('inactiva', 'reemplazada') THEN
      NEW.estado := 'Inactiva';
    ELSIF NEW.estado_fuente = 'activa' THEN
      NEW.estado := 'Activa';
    END IF;

  -- Si se actualiza estado → derivar estado_fuente
  ELSIF TG_OP = 'UPDATE' AND NEW.estado IS DISTINCT FROM OLD.estado THEN
    IF NEW.estado = 'Inactiva' AND (NEW.estado_fuente IS NULL OR NEW.estado_fuente = 'activa') THEN
      NEW.estado_fuente := 'inactiva';
    ELSIF NEW.estado = 'Activa' AND NEW.estado_fuente IN ('inactiva', 'reemplazada') THEN
      NEW.estado_fuente := 'activa';
    END IF;

  -- En INSERT: garantizar consistencia
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.estado_fuente IN ('inactiva', 'reemplazada') THEN
      NEW.estado := 'Inactiva';
    ELSIF NEW.estado_fuente = 'activa' OR NEW.estado_fuente IS NULL THEN
      -- estado_fuente NULL = activa por defecto
      IF NEW.estado = 'Activa' THEN
        NEW.estado_fuente := COALESCE(NEW.estado_fuente, 'activa');
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sincronizar_estado_fuente ON fuentes_pago;

CREATE TRIGGER trigger_sincronizar_estado_fuente
  BEFORE INSERT OR UPDATE OF estado, estado_fuente ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION sincronizar_estado_fuente_pago();

-- ============================================================
-- Verificación final: no deben quedar inconsistencias
-- ============================================================
SELECT
  COUNT(*) FILTER (
    WHERE estado = 'Activa' AND estado_fuente IN ('inactiva', 'reemplazada')
  ) AS inconsistentes_activa_fuente_inactiva,
  COUNT(*) FILTER (
    WHERE estado = 'Inactiva' AND estado_fuente = 'activa'
  ) AS inconsistentes_inactiva_fuente_activa,
  COUNT(*) FILTER (
    WHERE estado = 'Activa' AND (estado_fuente IS NULL OR estado_fuente = 'activa')
  ) AS consistentes_activas,
  COUNT(*) FILTER (
    WHERE estado = 'Inactiva' AND estado_fuente IN ('inactiva', 'reemplazada')
  ) AS consistentes_inactivas
FROM fuentes_pago;
