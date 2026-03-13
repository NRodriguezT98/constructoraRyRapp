-- ============================================================
-- TRIGGER: Limpiar documentos_pendientes al inactivar fuente
-- ============================================================
--
-- Problema: Al quitar una fuente de pago en "Ajustar Plan",
--           el código hace UPDATE estado_fuente = 'inactiva'
--           (soft delete). La fila permanece, así que el
--           ON DELETE CASCADE de documentos_pendientes NO
--           se dispara y el pendiente queda visible en
--           Documentación aunque la fuente ya no exista.
--
-- Solución: Trigger AFTER UPDATE que borra los pendientes
--           de estado 'Pendiente' cuando la fuente pasa a
--           'inactiva' o 'reemplazada'.
--
-- Fecha: 2026-03-12
-- ============================================================

CREATE OR REPLACE FUNCTION limpiar_pendientes_fuente_inactivada()
RETURNS TRIGGER AS $$
BEGIN
  -- Actuar solo cuando la fuente pasa a inactiva/reemplazada
  IF NEW.estado_fuente IN ('inactiva', 'reemplazada')
    AND (OLD.estado_fuente IS NULL
         OR OLD.estado_fuente NOT IN ('inactiva', 'reemplazada'))
  THEN
    DELETE FROM documentos_pendientes
    WHERE fuente_pago_id = NEW.id
      AND estado = 'Pendiente';

    RAISE NOTICE 'Pendientes eliminados para fuente_pago % al pasar a estado %',
      NEW.id, NEW.estado_fuente;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear trigger (idempotente)
DROP TRIGGER IF EXISTS trigger_limpiar_pendientes_fuente_inactiva ON fuentes_pago;

CREATE TRIGGER trigger_limpiar_pendientes_fuente_inactiva
  AFTER UPDATE OF estado_fuente ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION limpiar_pendientes_fuente_inactivada();

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT
  t.tgname    AS trigger_name,
  c.relname   AS table_name,
  p.proname   AS function_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'Habilitado ✅'
    WHEN 'D' THEN 'Deshabilitado ❌'
  END AS status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p  ON t.tgfoid = p.oid
WHERE c.relname = 'fuentes_pago'
  AND t.tgname = 'trigger_limpiar_pendientes_fuente_inactiva';
