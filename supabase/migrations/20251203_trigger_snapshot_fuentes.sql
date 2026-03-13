-- ==================================================
-- TRIGGER: Snapshot cuando se modifican fuentes de pago
-- Fecha: 2025-12-03
-- Descripción: Crea snapshot de negociación cuando se inactiva/modifica fuente
-- ==================================================

-- Función para crear snapshot cuando cambian fuentes
CREATE OR REPLACE FUNCTION crear_snapshot_por_cambio_fuente()
RETURNS TRIGGER AS $$
DECLARE
  v_negociacion RECORD;
  v_fuentes JSONB;
  v_documentos JSONB;
  v_version_nueva INTEGER;
  v_tipo_cambio TEXT;
  v_razon TEXT;
BEGIN
  -- Obtener datos de la negociación
  SELECT * INTO v_negociacion
  FROM negociaciones
  WHERE id = COALESCE(NEW.negociacion_id, OLD.negociacion_id);

  -- Determinar tipo de cambio
  IF TG_OP = 'INSERT' THEN
    v_tipo_cambio := 'fuente_agregada';
    v_razon := format('Nueva fuente de pago agregada: %s', NEW.tipo);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.estado_fuente = 'activa' AND NEW.estado_fuente = 'inactiva' THEN
      v_tipo_cambio := 'fuente_inactivada';
      v_razon := COALESCE(NEW.razon_inactivacion, 'Fuente de pago inactivada');
    ELSE
      v_tipo_cambio := 'fuente_modificada';
      v_razon := format('Fuente de pago actualizada: %s', NEW.tipo);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_tipo_cambio := 'fuente_eliminada';
    v_razon := format('Fuente de pago eliminada: %s', OLD.tipo);
  END IF;

  -- Incrementar version_lock en negociaciones
  UPDATE negociaciones
  SET version_lock = version_lock + 1,
      fecha_ultima_modificacion = NOW()
  WHERE id = v_negociacion.id
  RETURNING version_lock INTO v_version_nueva;

  -- Obtener snapshot de fuentes ACTIVAS (estado actual)
  SELECT COALESCE(jsonb_agg(to_jsonb(f)), '[]'::jsonb)
  INTO v_fuentes
  FROM fuentes_pago f
  WHERE f.negociacion_id = v_negociacion.id
    AND f.estado_fuente = 'activa';

  -- Obtener documentos del cliente
  SELECT COALESCE(jsonb_agg(to_jsonb(d)), '[]'::jsonb)
  INTO v_documentos
  FROM documentos_cliente d
  WHERE d.cliente_id = v_negociacion.cliente_id
    AND d.estado_documento = 'activo';

  -- Crear snapshot en historial
  INSERT INTO negociaciones_historial (
    negociacion_id,
    version,
    datos_negociacion,
    fuentes_pago_snapshot,
    documentos_snapshot,
    tipo_cambio,
    razon_cambio,
    campos_modificados,
    datos_anteriores,
    datos_nuevos,
    usuario_id,
    fecha_cambio
  ) VALUES (
    v_negociacion.id,
    v_version_nueva,
    to_jsonb(v_negociacion),
    v_fuentes,
    v_documentos,
    v_tipo_cambio,
    v_razon,
    ARRAY['fuentes_pago'], -- Campo modificado
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    NOW()
  );

  -- Actualizar version_actual en negociaciones si es cambio significativo
  IF v_tipo_cambio IN ('fuente_agregada', 'fuente_inactivada', 'fuente_eliminada') THEN
    UPDATE negociaciones
    SET version_actual = version_actual + 1
    WHERE id = v_negociacion.id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger AFTER INSERT/UPDATE/DELETE en fuentes_pago
DROP TRIGGER IF EXISTS trigger_snapshot_cambio_fuente ON fuentes_pago;
CREATE TRIGGER trigger_snapshot_cambio_fuente
  AFTER INSERT OR UPDATE OR DELETE ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION crear_snapshot_por_cambio_fuente();

-- ✅ Comentarios
COMMENT ON FUNCTION crear_snapshot_por_cambio_fuente() IS
  'Crea snapshot automático cuando se agrega, modifica, inactiva o elimina una fuente de pago';

COMMENT ON TRIGGER trigger_snapshot_cambio_fuente ON fuentes_pago IS
  'Dispara snapshot de negociación cuando cambian las fuentes de pago (sistema de versionado)';
