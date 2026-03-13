-- =====================================================
-- FORZAR RECREACIÓN DE TRIGGERS (eliminar viejos)
-- =====================================================
-- Fecha: 2025-12-03
-- Problema: Triggers cacheados siguen usando tabla_afectada
-- Solución: DROP completo + recreación desde cero
-- =====================================================

-- =====================================================
-- 1. ELIMINAR TRIGGERS Y FUNCIONES VIEJAS
-- =====================================================

DROP TRIGGER IF EXISTS trigger_inactivar_fuente_pago ON fuentes_pago CASCADE;
DROP FUNCTION IF EXISTS trigger_inactivar_fuente_pago() CASCADE;

DROP TRIGGER IF EXISTS trigger_vincular_documento_automatico ON documentos_cliente CASCADE;
DROP FUNCTION IF EXISTS vincular_documento_fuente_automatico() CASCADE;

-- =====================================================
-- 2. RECREAR FUNCIÓN: Inactivación de fuentes
-- =====================================================

CREATE FUNCTION trigger_inactivar_fuente_pago()
RETURNS TRIGGER AS $$
DECLARE
  v_documentos_afectados INT := 0;
BEGIN
  -- Solo procesar si se marca como inactiva
  IF NEW.estado_fuente = 'inactiva' AND (OLD.estado_fuente IS NULL OR OLD.estado_fuente = 'activa') THEN

    -- Marcar documentos pendientes como obsoletos
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

    -- ✅ Auditar SOLO si hay usuario autenticado (evitar errores en sistema)
    IF auth.uid() IS NOT NULL THEN
      INSERT INTO audit_log (
        tabla,
        accion,
        registro_id,
        datos_anteriores,
        datos_nuevos,
        metadata,
        usuario_id,
        usuario_email
      ) VALUES (
        'fuentes_pago',
        'UPDATE',
        NEW.id,
        to_jsonb(OLD),
        to_jsonb(NEW),
        jsonb_build_object(
          'razon', COALESCE(NEW.razon_inactivacion, 'Sin motivo especificado'),
          'documentos_obsoletos', v_documentos_afectados,
          'tipo', NEW.tipo,
          'monto_aprobado', NEW.monto_aprobado,
          'estado_anterior', COALESCE(OLD.estado_fuente, 'activa'),
          'estado_nuevo', NEW.estado_fuente
        ),
        auth.uid(),
        COALESCE(auth.email(), 'sistema@ryrconstrucciones.com')
      );
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. RECREAR TRIGGER: Inactivación de fuentes
-- =====================================================

CREATE TRIGGER trigger_inactivar_fuente_pago
  AFTER UPDATE OF estado_fuente ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION trigger_inactivar_fuente_pago();

-- =====================================================
-- 4. RECREAR FUNCIÓN: Vinculación automática
-- =====================================================

CREATE FUNCTION vincular_documento_fuente_automatico()
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

    IF FOUND THEN
      -- 1. Actualizar fuente_pago
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

      -- 3. ✅ Auditar (solo si hay usuario)
      IF auth.uid() IS NOT NULL THEN
        INSERT INTO audit_log (
          tabla,
          accion,
          registro_id,
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. RECREAR TRIGGER: Vinculación automática
-- =====================================================

CREATE TRIGGER trigger_vincular_documento_automatico
  AFTER INSERT ON documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION vincular_documento_fuente_automatico();

-- =====================================================
-- VALIDACIÓN FINAL
-- =====================================================

DO $$
DECLARE
  v_trigger_count INT;
BEGIN
  -- Verificar que los triggers existen
  SELECT COUNT(*) INTO v_trigger_count
  FROM pg_trigger
  WHERE tgname IN ('trigger_inactivar_fuente_pago', 'trigger_vincular_documento_automatico');

  IF v_trigger_count < 2 THEN
    RAISE EXCEPTION 'ERROR: No se crearon todos los triggers';
  END IF;

  RAISE NOTICE '✅ Triggers recreados exitosamente desde cero';
  RAISE NOTICE '   - trigger_inactivar_fuente_pago: ACTIVO';
  RAISE NOTICE '   - trigger_vincular_documento_automatico: ACTIVO';
  RAISE NOTICE '   - Columnas corregidas: tabla, registro_id';
END $$;
