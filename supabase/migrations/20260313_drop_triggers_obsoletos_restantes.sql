-- =====================================================
-- FIX: Eliminar TODOS los triggers obsoletos que referencian
--      documentos_pendientes o pasos_fuente_pago (tablas ya eliminadas)
-- Fecha: 2026-03-13
-- =====================================================

-- =====================================================
-- TABLA: documentos_cliente (4 triggers)
-- =====================================================

DROP TRIGGER IF EXISTS tr_marcar_pendiente_compartido_on_insert ON documentos_cliente;
DROP TRIGGER IF EXISTS tr_verificar_documentos_pendientes_on_insert ON documentos_cliente;
DROP TRIGGER IF EXISTS tr_vincular_documento_a_pendientes_fuente_on_insert ON documentos_cliente;
DROP TRIGGER IF EXISTS trg_vincular_carta_simple ON documentos_cliente;

DROP FUNCTION IF EXISTS marcar_pendiente_compartido_on_insert() CASCADE;
DROP FUNCTION IF EXISTS verificar_documentos_pendientes_on_insert() CASCADE;
DROP FUNCTION IF EXISTS vincular_documento_a_pendientes_fuente_on_insert() CASCADE;
DROP FUNCTION IF EXISTS vincular_carta_aprobacion_simple() CASCADE;

-- =====================================================
-- TABLA: fuentes_pago (2 triggers)
-- =====================================================

DROP TRIGGER IF EXISTS trg_invalidar_pasos_fuente_modificada ON fuentes_pago;
DROP TRIGGER IF EXISTS trigger_limpiar_pendientes_fuente_inactiva ON fuentes_pago;

DROP FUNCTION IF EXISTS invalidar_pasos_fuente_modificada() CASCADE;
DROP FUNCTION IF EXISTS limpiar_pendientes_fuente_inactivada() CASCADE;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_proc p ON p.oid = t.tgfoid
  WHERE c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND t.tgisinternal = false
    AND (
      pg_get_functiondef(p.oid) ILIKE '%documentos_pendientes%'
      OR pg_get_functiondef(p.oid) ILIKE '%pasos_fuente_pago%'
    );

  IF v_count > 0 THEN
    RAISE EXCEPTION 'Aún existen % trigger(s) que referencian tablas obsoletas', v_count;
  END IF;

  RAISE NOTICE '✅ Todos los triggers obsoletos eliminados (documentos_cliente: 4, fuentes_pago: 2)';
END $$;
