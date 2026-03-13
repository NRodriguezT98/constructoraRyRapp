-- ============================================
-- DESHABILITAR TRIGGER AUTOMÁTICO DE SNAPSHOT
-- ============================================
--
-- Problema: Trigger crea snapshots automáticos SIN contexto del usuario
-- Solución: Deshabilitar trigger, usar SOLO snapshot manual desde service
--
-- Ventajas del snapshot manual:
-- - Incluye motivo escrito por el usuario
-- - Resumen de cambios (agregadas/eliminadas/modificadas)
-- - Se crea UNA SOLA VEZ por operación completa
--
-- Fecha: 2025-12-03
-- ============================================

-- Deshabilitar trigger automático
DROP TRIGGER IF EXISTS trigger_snapshot_cambio_fuente ON fuentes_pago;

-- Opcional: Mantener la función por si se necesita en el futuro
-- (comentar siguiente línea si quieres mantener la función)
-- DROP FUNCTION IF EXISTS crear_snapshot_por_cambio_fuente();

-- Verificar que trigger fue eliminado
SELECT
  COALESCE(
    (SELECT COUNT(*) FROM pg_trigger t
     JOIN pg_class c ON t.tgrelid = c.oid
     WHERE c.relname = 'fuentes_pago'
       AND t.tgname = 'trigger_snapshot_cambio_fuente'),
    0
  ) as triggers_activos;

-- Si resultado = 0 → Trigger deshabilitado exitosamente
