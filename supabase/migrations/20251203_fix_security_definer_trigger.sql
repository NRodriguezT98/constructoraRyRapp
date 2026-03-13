-- ============================================
-- FIX: Agregar SECURITY DEFINER a handle_fuente_inactivada
-- ============================================
--
-- Problema: RLS de audit_log bloquea INSERT desde trigger
-- Solución: SECURITY DEFINER permite ejecutar con permisos elevados
--
-- Fecha: 2025-12-03
-- ============================================

-- Recrear función con SECURITY DEFINER
CREATE OR REPLACE FUNCTION handle_fuente_inactivada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- ✅ CRÍTICO: Evita RLS en audit_log
SET search_path = public
AS $$
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

    -- Auditar cambio con columnas correctas de audit_log
    INSERT INTO audit_log (
      tabla,
      accion,
      registro_id,
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
$$;

-- Verificar
SELECT
  'OK - Función ahora es SECURITY DEFINER' as status,
  prosecdef as security_definer
FROM pg_proc
WHERE proname = 'handle_fuente_inactivada';
