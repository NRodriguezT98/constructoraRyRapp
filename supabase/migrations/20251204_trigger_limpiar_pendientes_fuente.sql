-- ============================================
-- TRIGGER: Limpiar documentos pendientes al eliminar fuente
-- ============================================
--
-- Problema: Cuando se elimina una fuente_pago (por reemplazo en nueva versión),
--           los documentos_pendientes quedan huérfanos y aparecen incorrectamente
--
-- Solución: Al eliminar fuente_pago, eliminar sus documentos_pendientes asociados
--
-- Fecha: 2025-12-04
-- ============================================

-- Función que limpia pendientes huérfanos
CREATE OR REPLACE FUNCTION limpiar_pendientes_fuente_eliminada()
RETURNS TRIGGER AS $$
BEGIN
  -- Eliminar documentos pendientes de la fuente que se está eliminando
  DELETE FROM documentos_pendientes
  WHERE fuente_pago_id = OLD.id
    AND estado = 'Pendiente';  -- Solo los pendientes, no los completados

  RAISE NOTICE 'Pendientes eliminados para fuente_pago %', OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger BEFORE DELETE en fuentes_pago
DROP TRIGGER IF EXISTS trigger_limpiar_pendientes_fuente ON fuentes_pago;

CREATE TRIGGER trigger_limpiar_pendientes_fuente
  BEFORE DELETE ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION limpiar_pendientes_fuente_eliminada();

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================

-- Ver que el trigger quedó creado
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'Enabled ✅'
    WHEN 'D' THEN 'Disabled ❌'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'fuentes_pago'
  AND t.tgname = 'trigger_limpiar_pendientes_fuente';
