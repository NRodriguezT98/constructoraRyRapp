-- ============================================
-- FIX: Corregir trigger de vinculación automática
-- ============================================
-- Fecha: 2025-12-01
-- Problema: El trigger usa NEW.entidad_id pero en documentos_cliente el campo es cliente_id
-- ============================================

CREATE OR REPLACE FUNCTION vincular_documento_subido_a_fuente_pendiente()
RETURNS TRIGGER AS $$
DECLARE
  v_fuente_pendiente RECORD;
  v_metadata JSONB;
BEGIN
  -- Solo para documentos de clientes con categoría "Cartas Aprobación"
  IF NEW.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34' AND NEW.metadata IS NOT NULL THEN

    v_metadata := NEW.metadata;

    -- Buscar documento pendiente que coincida
    SELECT * INTO v_fuente_pendiente
    FROM documentos_pendientes dp
    WHERE dp.cliente_id = NEW.cliente_id  -- ✅ CORREGIDO: era NEW.entidad_id
      AND dp.estado = 'Pendiente'
      AND dp.categoria_id = NEW.categoria_id
      -- Coincidencia por tipo_fuente en metadata
      AND (dp.metadata->>'tipo_fuente') = (v_metadata->>'tipo_fuente')
      -- Coincidencia opcional por entidad (si existe)
      AND (
        (dp.metadata->>'entidad') = ''
        OR (dp.metadata->>'entidad') = (v_metadata->>'entidad')
      )
    LIMIT 1;

    -- Si encontró coincidencia → vincular
    IF FOUND THEN

      -- 1. Actualizar fuente_pago con URL del documento
      UPDATE fuentes_pago
      SET
        carta_aprobacion_url = NEW.url_storage,  -- ✅ CORREGIDO: usar url_storage
        estado_documentacion = 'Completo',
        fecha_actualizacion = NOW()
      WHERE id = v_fuente_pendiente.fuente_pago_id;

      -- 2. Marcar pendiente como completado
      UPDATE documentos_pendientes
      SET
        estado = 'Completado',
        fecha_completado = NOW()
      WHERE id = v_fuente_pendiente.id;

      -- 3. Registrar en audit_log
      INSERT INTO audit_log (
        tabla,
        accion,
        registro_id,
        usuario_email,
        datos_nuevos,
        metadata
      ) VALUES (
        'documentos_pendientes',
        'UPDATE',
        v_fuente_pendiente.id,
        'sistema@trigger',
        jsonb_build_object(
          'estado', 'Completado',
          'documento_id', NEW.id,
          'vinculado_automaticamente', true
        ),
        jsonb_build_object(
          'tipo_fuente', v_metadata->>'tipo_fuente',
          'entidad', v_metadata->>'entidad',
          'documento_titulo', NEW.titulo
        )
      );

      RAISE NOTICE '✅ Documento % vinculado automáticamente a fuente %',
        NEW.id, v_fuente_pendiente.fuente_pago_id;

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ✅ Trigger ya existe, solo reemplazamos la función
COMMENT ON FUNCTION vincular_documento_subido_a_fuente_pendiente() IS
'Detecta cuando se sube un documento de categoría Cartas Aprobación y lo vincula automáticamente con documentos_pendientes por metadata';
