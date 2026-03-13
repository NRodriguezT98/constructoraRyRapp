-- ============================================
-- TRIGGER: Limpiar pendientes cuando fuente se INACTIVA
-- ============================================
-- Autor: Sistema RyR
-- Fecha: 2025-12-04
-- Descripción: Elimina documentos pendientes cuando fuente_pago
--              cambia a estado_fuente = 'inactiva' (reemplazada)
-- ============================================

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS trigger_limpiar_pendientes_fuente_inactiva ON fuentes_pago;
DROP FUNCTION IF EXISTS limpiar_pendientes_fuente_inactiva();

-- Función: Eliminar pendientes cuando fuente se inactiva
CREATE OR REPLACE FUNCTION limpiar_pendientes_fuente_inactiva()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la fuente cambió de 'activa' a 'inactiva'
  IF OLD.estado_fuente = 'activa' AND NEW.estado_fuente = 'inactiva' THEN
    DELETE FROM documentos_pendientes
    WHERE fuente_pago_id = OLD.id
      AND estado = 'Pendiente';

    RAISE NOTICE 'Eliminados documentos pendientes de fuente % (inactivada)', OLD.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger en UPDATE
CREATE TRIGGER trigger_limpiar_pendientes_fuente_inactiva
  AFTER UPDATE OF estado_fuente ON fuentes_pago
  FOR EACH ROW
  WHEN (OLD.estado_fuente IS DISTINCT FROM NEW.estado_fuente)
  EXECUTE FUNCTION limpiar_pendientes_fuente_inactiva();

COMMENT ON TRIGGER trigger_limpiar_pendientes_fuente_inactiva ON fuentes_pago IS
  'Elimina documentos pendientes cuando fuente cambia a estado_fuente=inactiva';
