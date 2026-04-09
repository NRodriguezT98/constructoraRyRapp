-- Fix aplicado: 2026-04-09
-- Razón: La limpieza LIMPIEZA-AUDITORIA-2026-04.sql eliminó la columna
--        fecha_ultima_modificacion de la tabla negociaciones. El trigger
--        crear_snapshot_por_cambio_fuente() seguía referenciando esa columna
--        en el UPDATE de version_lock, causando:
--        record "new" has no field "fecha_ultima_modificacion"
--
-- Solución: Reemplazar la función del trigger sin la columna eliminada.

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
  -- NOTA: fecha_ultima_modificacion fue eliminada en LIMPIEZA-AUDITORIA-2026-04
  UPDATE negociaciones
  SET version_lock = version_lock + 1
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
    NULL,
    NULL,
    NULL,
    NULL,
    NOW()
  );

  -- Retornar el registro correcto según la operación
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;
