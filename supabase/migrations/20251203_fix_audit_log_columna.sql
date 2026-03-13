-- =====================================================
-- FIX: Corregir triggers que usan columna incorrecta
-- =====================================================
-- Fecha: 2025-12-03
-- Problema: Triggers usan 'tabla_afectada' pero audit_log usa 'tabla'
-- =====================================================

-- 1. Actualizar trigger de vinculación automática de documentos
CREATE OR REPLACE FUNCTION vincular_documento_fuente_automatico()
RETURNS TRIGGER AS $$
DECLARE
  v_metadata jsonb;
  v_fuente_pendiente RECORD;
BEGIN
  -- Solo procesar si tiene metadata de fuente_pago
  IF NEW.metadata ? 'fuente_pago_id' THEN
    v_metadata := NEW.metadata;

    -- Buscar pendiente sin completar
    SELECT *
    INTO v_fuente_pendiente
    FROM documentos_pendientes
    WHERE
      fuente_pago_id = (v_metadata->>'fuente_pago_id')::UUID
      AND tipo_documento = 'Carta de Aprobación'
      AND estado = 'Pendiente'
    ORDER BY fecha_creacion DESC
    LIMIT 1;

    -- Si encontró coincidencia → vincular
    IF FOUND THEN

      -- 1. Actualizar fuente_pago con URL del documento
      UPDATE fuentes_pago
      SET
        carta_aprobacion_url = NEW.url,
        estado_documentacion = 'Completo',
        fecha_actualizacion = NOW()
      WHERE id = v_fuente_pendiente.fuente_pago_id;

      -- 2. Marcar pendiente como completado
      UPDATE documentos_pendientes
      SET
        estado = 'Completado',
        fecha_completado = NOW(),
        completado_por = auth.uid() -- Usuario que subió
      WHERE id = v_fuente_pendiente.id;

      -- 3. ✅ Registrar en auditoría con columna CORRECTA
      INSERT INTO audit_log (
        tabla,              -- ✅ Cambiado de tabla_afectada
        accion,
        registro_id,        -- ✅ Cambiado de id_registro
        metadata,
        usuario_id,
        usuario_email
      ) VALUES (
        'fuentes_pago',
        'UPDATE',           -- ✅ Estandarizado (CREATE/UPDATE/DELETE)
        v_fuente_pendiente.fuente_pago_id,
        jsonb_build_object(
          'documento_id', NEW.id,
          'tipo_fuente', v_metadata->>'tipo_fuente',
          'pendiente_id', v_fuente_pendiente.id,
          'razon', 'Vinculación automática de documento'
        ),
        auth.uid(),
        COALESCE(auth.email(), 'sistema@ryrconstrucciones.com')
      );

    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Recrear trigger
DROP TRIGGER IF EXISTS trigger_vincular_documento_automatico ON documentos_cliente;
CREATE TRIGGER trigger_vincular_documento_automatico
  AFTER INSERT ON documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION vincular_documento_fuente_automatico();

-- =====================================================
-- VALIDACIÓN
-- =====================================================

-- Verificar que audit_log tiene la columna correcta
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_log' AND column_name = 'tabla'
  ) THEN
    RAISE EXCEPTION 'ERROR: audit_log no tiene columna "tabla". Ejecutar migración 20251104_create_audit_log.sql primero';
  END IF;

  RAISE NOTICE '✅ Trigger corregido: ahora usa columna "tabla" en lugar de "tabla_afectada"';
END $$;
