-- ====================================================================
-- MIGRACIÓN 041: Corregir handle_fuente_inactivada tras limpieza de BD
-- ====================================================================
--
-- PROBLEMA:
--   La migración LIMPIEZA-AUDITORIA-2026-04.sql eliminó la columna
--   estado_documento de documentos_cliente (era un vestigio).
--   El trigger handle_fuente_inactivada todavía referencia esa columna
--   para marcar documentos como 'obsoletos' cuando se inactiva una fuente.
--   Esto rompe el RPC registrar_renuncia_completa con error:
--     "column estado_documento does not exist"
--
-- SOLUCIÓN:
--   Eliminar el bloque UPDATE que marcaba documentos como obsoletos.
--   La obsolescencia de documentos ya no se gestiona por este campo;
--   los documentos quedan vinculados a la fuente y se muestran en
--   el historial del cliente con su estado propio (estado enum).
--
-- Fecha: 2026-04-09
-- ====================================================================

CREATE OR REPLACE FUNCTION handle_fuente_inactivada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_email TEXT;
  v_es_renuncia BOOLEAN;
BEGIN
  -- Solo si cambia de activa a inactiva/reemplazada
  IF OLD.estado_fuente = 'activa' AND NEW.estado_fuente IN ('inactiva', 'reemplazada') THEN

    -- Verificar si estamos en contexto de renuncia
    v_es_renuncia := current_setting('app.renuncia_en_curso', true) = 'true';

    -- Validar que no tenga dinero recibido
    -- SKIP si es una renuncia (la función RPC ya hizo sus propias validaciones)
    IF NEW.monto_recibido > 0 AND NOT v_es_renuncia THEN
      RAISE EXCEPTION 'PROHIBIDO: No se puede inactivar una fuente con dinero recibido ($ %)',
        NEW.monto_recibido
        USING HINT = 'Esta fuente ya recibió abonos/desembolsos';
    END IF;

    -- Obtener email del usuario autenticado
    SELECT COALESCE(
      auth.email(),
      'sistema@constructoraryr.com'
    ) INTO v_usuario_email;

    -- NOTA: El bloque UPDATE documentos_cliente SET estado_documento = 'obsoleto'
    -- fue eliminado porque la columna estado_documento no existe más
    -- (eliminada en LIMPIEZA-AUDITORIA-2026-04.sql).

    -- Auditar cambio
    INSERT INTO audit_log (
      tabla,
      accion,
      registro_id,
      usuario_email,
      datos_anteriores,
      datos_nuevos,
      metadata
    ) VALUES (
      'fuentes_pago',
      'UPDATE',
      NEW.id,
      v_usuario_email,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'operacion', CASE WHEN v_es_renuncia THEN 'INACTIVACION_POR_RENUNCIA' ELSE 'INACTIVACION' END,
        'razon', NEW.razon_inactivacion,
        'tipo', NEW.tipo,
        'monto_aprobado', NEW.monto_aprobado,
        'monto_recibido', NEW.monto_recibido
      )
    );

  END IF;

  RETURN NEW;
END;
$$;

SELECT 'OK - handle_fuente_inactivada actualizado sin referencia a estado_documento' AS status;
