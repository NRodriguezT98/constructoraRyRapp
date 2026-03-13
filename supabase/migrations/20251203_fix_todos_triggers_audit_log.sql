-- =====================================================
-- FIX COMPLETO: Corregir TODOS los triggers con tabla_afectada
-- =====================================================
-- Fecha: 2025-12-03
-- Problema: Múltiples triggers usan 'tabla_afectada' e 'id_registro'
--           pero audit_log usa 'tabla' y 'registro_id'
-- =====================================================

-- =====================================================
-- 1. TRIGGER: Inactivación de fuentes de pago
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_inactivar_fuente_pago()
RETURNS TRIGGER AS $$
DECLARE
  v_documentos_afectados INT;
BEGIN
  -- Solo procesar si se marca como inactiva
  IF NEW.estado_fuente = 'inactiva' AND OLD.estado_fuente = 'activa' THEN

    -- Marcar documentos pendientes relacionados como obsoletos
    UPDATE documentos_pendientes
    SET
      estado = 'Obsoleto',
      razon_obsolescencia = COALESCE(
        NEW.razon_inactivacion,
        'Fuente de pago eliminada o reemplazada'
      ),
      fecha_obsolescencia = NOW()
    WHERE
      fuente_pago_relacionada = NEW.id
      AND estado_documento = 'activo';

    GET DIAGNOSTICS v_documentos_afectados = ROW_COUNT;

    -- ✅ Auditar con columnas CORRECTAS
    INSERT INTO audit_log (
      tabla,              -- ✅ CORREGIDO
      accion,
      registro_id,        -- ✅ CORREGIDO
      datos_anteriores,
      datos_nuevos,
      metadata,
      usuario_id,
      usuario_email
    ) VALUES (
      'fuentes_pago',
      'UPDATE',           -- ✅ Estandarizado
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'razon', NEW.razon_inactivacion,
        'documentos_obsoletos', v_documentos_afectados,
        'tipo', NEW.tipo,
        'monto_aprobado', NEW.monto_aprobado,
        'estado_anterior', OLD.estado_fuente,
        'estado_nuevo', NEW.estado_fuente
      ),
      auth.uid(),
      COALESCE(auth.email(), 'sistema@ryrconstrucciones.com')
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear trigger
DROP TRIGGER IF EXISTS trigger_inactivar_fuente_pago ON fuentes_pago;
CREATE TRIGGER trigger_inactivar_fuente_pago
  AFTER UPDATE OF estado_fuente ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION trigger_inactivar_fuente_pago();

-- =====================================================
-- 2. TRIGGER: Vinculación automática de documentos
-- =====================================================

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
        completado_por = auth.uid()
      WHERE id = v_fuente_pendiente.id;

      -- 3. ✅ Auditar con columnas CORRECTAS
      INSERT INTO audit_log (
        tabla,              -- ✅ CORREGIDO
        accion,
        registro_id,        -- ✅ CORREGIDO
        metadata,
        usuario_id,
        usuario_email
      ) VALUES (
        'fuentes_pago',
        'UPDATE',
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

-- Recrear trigger
DROP TRIGGER IF EXISTS trigger_vincular_documento_automatico ON documentos_cliente;
CREATE TRIGGER trigger_vincular_documento_automatico
  AFTER INSERT ON documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION vincular_documento_fuente_automatico();

-- =====================================================
-- VALIDACIÓN FINAL
-- =====================================================

DO $$
BEGIN
  -- Verificar que audit_log tiene las columnas correctas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_log' AND column_name = 'tabla'
  ) THEN
    RAISE EXCEPTION 'ERROR: audit_log no tiene columna "tabla"';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_log' AND column_name = 'registro_id'
  ) THEN
    RAISE EXCEPTION 'ERROR: audit_log no tiene columna "registro_id"';
  END IF;

  RAISE NOTICE '✅ TODOS los triggers corregidos exitosamente';
  RAISE NOTICE '   - trigger_inactivar_fuente_pago';
  RAISE NOTICE '   - trigger_vincular_documento_automatico';
END $$;
