-- ============================================
-- FIX FINAL: Corregir handle_fuente_inactivada
-- ============================================
--
-- Problema CRÍTICO: INSERT INTO audit_log usa 'tabla_afectada' que no existe
-- Solución: Cambiar a 'tabla' (columna correcta de audit_log)
--
-- Fecha: 2025-12-03
-- ============================================

-- Recrear función corregida
CREATE OR REPLACE FUNCTION handle_fuente_inactivada()
RETURNS TRIGGER AS $$
DECLARE
  v_documentos_afectados INTEGER;
BEGIN
  -- Solo si cambia de activa a inactiva/reemplazada
  IF OLD.estado_fuente = 'activa' AND NEW.estado_fuente IN ('inactiva', 'reemplazada') THEN

    -- Validar que no tenga dinero recibido
    IF NEW.monto_recibido > 0 THEN
      RAISE EXCEPTION 'PROHIBIDO: No se puede inactivar una fuente con dinero recibido ($ %)',
        NEW.monto_recibido
        USING HINT = 'Esta fuente ya recibió abonos/desembolsos';
      END IF;

    -- Marcar documentos relacionados como obsoletos
    UPDATE documentos_cliente
    SET
      estado_documento = 'obsoleto',
      razon_obsolescencia = COALESCE(
        NEW.razon_inactivacion,
        'Fuente de pago eliminada o reemplazada'
      ),
      fecha_obsolescencia = NOW()
    WHERE
      fuente_pago_relacionada = NEW.id
      AND estado_documento = 'activo';

    GET DIAGNOSTICS v_documentos_afectados = ROW_COUNT;

    -- ✅ CRÍTICO: Auditar cambio con columnas CORRECTAS de audit_log
    INSERT INTO audit_log (
      tabla,              -- ✅ Cambiado de 'tabla_afectada' a 'tabla'
      accion,
      registro_id,        -- ✅ Cambiado de 'id_registro' a 'registro_id'
      datos_anteriores,
      datos_nuevos,
      metadata
    ) VALUES (
      'fuentes_pago',
      'INACTIVACION',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'razon', NEW.razon_inactivacion,
        'documentos_obsoletos', v_documentos_afectados,
        'tipo', NEW.tipo,
        'monto_aprobado', NEW.monto_aprobado
      )
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar que función quedó correcta
SELECT
  'OK - Función actualizada correctamente' as status,
  proname as funcion
FROM pg_proc
WHERE proname = 'handle_fuente_inactivada';
