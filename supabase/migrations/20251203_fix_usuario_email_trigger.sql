-- ============================================
-- FIX: Agregar usuario_email a handle_fuente_inactivada
-- ============================================

CREATE OR REPLACE FUNCTION handle_fuente_inactivada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_documentos_afectados INTEGER;
  v_usuario_email TEXT;
BEGIN
  -- Solo si cambia de activa a inactiva/reemplazada
  IF OLD.estado_fuente = 'activa' AND NEW.estado_fuente IN ('inactiva', 'reemplazada') THEN

    -- Validar que no tenga dinero recibido
    IF NEW.monto_recibido > 0 THEN
      RAISE EXCEPTION 'PROHIBIDO: No se puede inactivar una fuente con dinero recibido ($ %)',
        NEW.monto_recibido
        USING HINT = 'Esta fuente ya recibió abonos/desembolsos';
      END IF;

    -- ✅ Obtener email del usuario autenticado
    SELECT COALESCE(
      auth.email(),
      'sistema@constructoraryr.com'
    ) INTO v_usuario_email;

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

    -- Auditar cambio con usuario_email
    INSERT INTO audit_log (
      tabla,
      accion,
      registro_id,
      usuario_email,     -- ✅ CRÍTICO: Campo obligatorio
      datos_anteriores,
      datos_nuevos,
      metadata
    ) VALUES (
      'fuentes_pago',
      'UPDATE',          -- ✅ Usar acción permitida (CREATE|UPDATE|DELETE)
      NEW.id,
      v_usuario_email,   -- ✅ Email del usuario
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'operacion', 'INACTIVACION',  -- ✅ Detalles en metadata
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

SELECT 'OK - Función actualizada con usuario_email' as status;
