-- ============================================
-- DESHABILITAR TRIGGER AUTOMÁTICO DE SNAPSHOTS
-- ============================================
-- Ahora usamos snapshots manuales creados desde el service
-- con motivo del usuario incluido
-- Fecha: 2025-12-03
-- ============================================

-- Deshabilitar trigger anterior que creaba snapshots por cada operación
DROP TRIGGER IF EXISTS trigger_snapshot_fuentes_pago ON fuentes_pago;
DROP TRIGGER IF EXISTS trigger_snapshot_fuentes_pago_batch ON fuentes_pago;

-- Eliminar funciones de batch (ya no las necesitamos)
DROP FUNCTION IF EXISTS crear_snapshot_batch_fuentes() CASCADE;
DROP FUNCTION IF EXISTS procesar_batch_snapshot() CASCADE;

-- Eliminar tabla temporal de batches
DROP TABLE IF EXISTS batch_cambios_temp CASCADE;

-- Mantener la función original por si se necesita para otros triggers
-- pero no la ejecutamos automáticamente
COMMENT ON FUNCTION crear_snapshot_por_cambio_fuente() IS
'[DESHABILITADO] Función legacy de snapshot automático. Ahora se crean manualmente desde el service con motivo del usuario.';

-- ============================================
-- VALIDACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Triggers automáticos deshabilitados';
  RAISE NOTICE '✅ Snapshots ahora se crean manualmente con motivo del usuario';
  RAISE NOTICE '✅ No más saltos de versiones (v14, v17, v20...)';
END $$;
