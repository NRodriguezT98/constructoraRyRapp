-- ============================================
-- FIX: Corregir función vincular_documento_pendiente_automatico
-- ============================================
--
-- Problema: INSERT INTO audit_log usa 'tabla_afectada' que no existe
-- Solución: Cambiar a 'tabla' (columna correcta)
--
-- Fecha: 2025-12-03
-- ============================================

-- Ver código actual de la función
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'vincular_documento_pendiente_automatico';

-- Recrear función corregida
CREATE OR REPLACE FUNCTION vincular_documento_pendiente_automatico()
RETURNS TRIGGER AS $$
DECLARE
  v_metadata JSONB;
  v_fuente_pendiente RECORD;
BEGIN
  -- Solo procesar si es carta de aprobación
  IF NEW.categoria != 'Carta de Aprobación' THEN
    RETURN NEW;
  END IF;

  -- Parsear metadata
  v_metadata := NEW.metadata;

  -- Solo continuar si tiene metadata de vinculación
  IF v_metadata ? 'negociacion_id' AND v_metadata ? 'tipo_fuente' THEN

    -- Buscar documento pendiente coincidente
    SELECT *
    INTO v_fuente_pendiente
    FROM documentos_pendientes
    WHERE estado = 'Pendiente'
      AND tipo_documento = 'carta_aprobacion'
      AND metadata->>'negociacion_id' = v_metadata->>'negociacion_id'
      AND metadata->>'tipo_fuente' = v_metadata->>'tipo_fuente'
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

      -- 3. ✅ CORREGIDO: Registrar en auditoría con columna correcta
      INSERT INTO audit_log (
        tabla,          -- ✅ Cambiado de 'tabla_afectada' a 'tabla'
        accion,
        registro_id,    -- ✅ Cambiado de 'id_registro' a 'registro_id'
        metadata
      ) VALUES (
        'fuentes_pago',
        'VINCULACION_AUTOMATICA_DOCUMENTO',
        v_fuente_pendiente.fuente_pago_id::TEXT,
        jsonb_build_object(
          'documento_id', NEW.id,
          'tipo_fuente', v_metadata->>'tipo_fuente',
          'pendiente_id', v_fuente_pendiente.id
        )
      );

    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar que la función quedó correcta
SELECT
  proname as funcion,
  pg_get_functiondef(oid) as definicion
FROM pg_proc
WHERE proname = 'vincular_documento_pendiente_automatico';
