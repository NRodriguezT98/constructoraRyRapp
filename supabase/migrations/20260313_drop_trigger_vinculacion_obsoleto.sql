-- =====================================================
-- FIX: Eliminar trigger de vinculación obsoleto en documentos_cliente
-- Fecha: 2026-03-13
-- Problema: trigger_vincular_documento_automatico referencia documentos_pendientes
--           (tabla ya eliminada → error 42P01 al insertar en documentos_cliente)
-- Causa: 20260314_limpiar_sistema_viejo.sql eliminó documentos_pendientes pero
--        no eliminó el trigger ni su función asociada en documentos_cliente.
-- =====================================================

-- Eliminar el trigger en documentos_cliente
DROP TRIGGER IF EXISTS trigger_vincular_documento_automatico ON documentos_cliente;

-- Eliminar las funciones de vinculación automática (ambas variantes de nombre)
DROP FUNCTION IF EXISTS vincular_documento_subido_a_fuente_pendiente() CASCADE;
DROP FUNCTION IF EXISTS vincular_documento_pendiente_automatico() CASCADE;
DROP FUNCTION IF EXISTS vincular_documento_fuente_automatico() CASCADE;

-- Verificación
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE c.relname = 'documentos_cliente'
      AND t.tgname = 'trigger_vincular_documento_automatico'
  ) THEN
    RAISE EXCEPTION 'ERROR: trigger_vincular_documento_automatico sigue existiendo en documentos_cliente';
  END IF;

  RAISE NOTICE '✅ Trigger obsoleto eliminado: documentos_cliente ya no referencia documentos_pendientes';
END $$;
