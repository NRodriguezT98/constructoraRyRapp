-- ============================================================
-- FIX: Remove reference to non-existent "metadata" column
-- in crear_snapshot_negociacion() trigger function
--
-- Problem: NEW.metadata->>'razon_cambio' crashes because
-- negociaciones table has no "metadata" column.
-- ============================================================

CREATE OR REPLACE FUNCTION crear_snapshot_negociacion()
RETURNS TRIGGER AS $$
DECLARE
  v_fuentes JSONB;
  v_documentos JSONB;
  v_campos_modificados TEXT[];
  v_tipo_cambio VARCHAR(100);
BEGIN
  -- Solo si hay cambios significativos
  IF (
    OLD.valor_negociado IS DISTINCT FROM NEW.valor_negociado OR
    OLD.descuento_aplicado IS DISTINCT FROM NEW.descuento_aplicado OR
    OLD.estado IS DISTINCT FROM NEW.estado OR
    OLD.vivienda_id IS DISTINCT FROM NEW.vivienda_id
  ) THEN

    -- Incrementar versión
    NEW.version_actual := OLD.version_actual + 1;

    -- Obtener fuentes actuales
    SELECT COALESCE(jsonb_agg(to_jsonb(f)), '[]'::jsonb)
    INTO v_fuentes
    FROM fuentes_pago f
    WHERE f.negociacion_id = NEW.id;

    -- Obtener documentos actuales del cliente
    SELECT COALESCE(jsonb_agg(to_jsonb(d)), '[]'::jsonb)
    INTO v_documentos
    FROM documentos_cliente d
    WHERE d.cliente_id = NEW.cliente_id
      AND d.estado_documento = 'activo';

    -- Detectar campos modificados
    v_campos_modificados := ARRAY[]::TEXT[];

    IF OLD.valor_negociado IS DISTINCT FROM NEW.valor_negociado THEN
      v_campos_modificados := array_append(v_campos_modificados, 'valor_negociado');
    END IF;

    IF OLD.descuento_aplicado IS DISTINCT FROM NEW.descuento_aplicado THEN
      v_campos_modificados := array_append(v_campos_modificados, 'descuento_aplicado');
    END IF;

    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
      v_campos_modificados := array_append(v_campos_modificados, 'estado');
    END IF;

    IF OLD.vivienda_id IS DISTINCT FROM NEW.vivienda_id THEN
      v_campos_modificados := array_append(v_campos_modificados, 'vivienda_id');
    END IF;

    -- Determinar tipo de cambio
    v_tipo_cambio := CASE
      WHEN 'vivienda_id' = ANY(v_campos_modificados) THEN 'Cambio de Vivienda'
      WHEN 'valor_negociado' = ANY(v_campos_modificados) THEN 'Modificación de Valor'
      WHEN 'descuento_aplicado' = ANY(v_campos_modificados) THEN 'Modificación de Descuento'
      WHEN 'estado' = ANY(v_campos_modificados) THEN 'Cambio de Estado'
      ELSE 'Modificación General'
    END;

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
      NEW.id,
      OLD.version_actual,
      to_jsonb(OLD),
      v_fuentes,
      v_documentos,
      v_tipo_cambio,
      COALESCE(NEW.notas, 'Sincronización automática desde edición de vivienda'),
      v_campos_modificados,
      jsonb_build_object(
        'valor_negociado', OLD.valor_negociado,
        'descuento_aplicado', OLD.descuento_aplicado,
        'estado', OLD.estado,
        'vivienda_id', OLD.vivienda_id
      ),
      jsonb_build_object(
        'valor_negociado', NEW.valor_negociado,
        'descuento_aplicado', NEW.descuento_aplicado,
        'estado', NEW.estado,
        'vivienda_id', NEW.vivienda_id
      ),
      auth.uid(),
      NOW()
    );

    -- Actualizar versión en fuentes_pago
    UPDATE fuentes_pago
    SET version_negociacion = NEW.version_actual
    WHERE negociacion_id = NEW.id
      AND estado_fuente = 'activa';

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
