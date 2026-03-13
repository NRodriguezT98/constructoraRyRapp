-- ============================================
-- OPTIMIZACIÓN: Agrupar cambios en batch en UNA sola versión
-- ============================================
-- Problema: Trigger crea snapshot por cada INSERT/UPDATE/DELETE
-- Solución: Detectar batch y agrupar en una sola versión
-- Fecha: 2025-12-03
-- ============================================

-- Paso 1: Agregar columna para rastrear batch
ALTER TABLE negociaciones_historial
ADD COLUMN IF NOT EXISTS batch_id UUID;

-- Paso 2: Crear tabla temporal para agrupar cambios de batch
CREATE TABLE IF NOT EXISTS batch_cambios_temp (
  batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negociacion_id UUID NOT NULL,
  cambios JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 3: Función mejorada para detectar y agrupar batch
CREATE OR REPLACE FUNCTION crear_snapshot_batch_fuentes()
RETURNS TRIGGER AS $$
DECLARE
  v_negociacion_id UUID;
  v_current_version INTEGER;
  v_new_version INTEGER;
  v_tipo_cambio TEXT;
  v_razon_cambio TEXT;
  v_datos_anteriores JSONB;
  v_datos_nuevos JSONB;
  v_fuentes_activas JSONB;
  v_documentos JSONB;
  v_datos_negociacion JSONB;
  v_campos_modificados TEXT[];
  v_batch_exists BOOLEAN;
  v_batch_id UUID;
  v_cambio_detalle JSONB;
BEGIN
  -- Determinar ID de negociación
  IF TG_OP = 'DELETE' THEN
    v_negociacion_id := OLD.negociacion_id;
  ELSE
    v_negociacion_id := NEW.negociacion_id;
  END IF;

  -- Verificar si existe un batch activo (creado en los últimos 2 segundos)
  SELECT EXISTS(
    SELECT 1 FROM batch_cambios_temp
    WHERE negociacion_id = v_negociacion_id
      AND created_at > NOW() - INTERVAL '2 seconds'
  ) INTO v_batch_exists;

  -- Si existe batch activo, agregar a cambios y salir
  IF v_batch_exists THEN
    -- Construir detalle del cambio
    IF TG_OP = 'INSERT' THEN
      v_cambio_detalle := jsonb_build_object(
        'tipo', 'agregada',
        'fuente', NEW.tipo,
        'entidad', COALESCE(NEW.entidad, ''),
        'monto', NEW.monto_aprobado
      );
    ELSIF TG_OP = 'DELETE' THEN
      v_cambio_detalle := jsonb_build_object(
        'tipo', 'eliminada',
        'fuente', OLD.tipo,
        'entidad', COALESCE(OLD.entidad, ''),
        'monto', OLD.monto_aprobado
      );
    ELSIF TG_OP = 'UPDATE' THEN
      v_cambio_detalle := jsonb_build_object(
        'tipo', 'modificada',
        'fuente', NEW.tipo,
        'entidad', COALESCE(NEW.entidad, ''),
        'monto_anterior', OLD.monto_aprobado,
        'monto_nuevo', NEW.monto_aprobado
      );
    END IF;

    -- Agregar cambio al batch
    UPDATE batch_cambios_temp
    SET cambios = cambios || v_cambio_detalle
    WHERE negociacion_id = v_negociacion_id
      AND created_at > NOW() - INTERVAL '2 seconds';

    RETURN NULL;
  END IF;

  -- Crear nuevo batch
  INSERT INTO batch_cambios_temp (negociacion_id, cambios)
  VALUES (v_negociacion_id, jsonb_build_array(
    CASE
      WHEN TG_OP = 'INSERT' THEN jsonb_build_object(
        'tipo', 'agregada',
        'fuente', NEW.tipo,
        'entidad', COALESCE(NEW.entidad, ''),
        'monto', NEW.monto_aprobado
      )
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object(
        'tipo', 'eliminada',
        'fuente', OLD.tipo,
        'entidad', COALESCE(OLD.entidad, ''),
        'monto', OLD.monto_aprobado
      )
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
        'tipo', 'modificada',
        'fuente', NEW.tipo,
        'entidad', COALESCE(NEW.entidad, ''),
        'monto_anterior', OLD.monto_aprobado,
        'monto_nuevo', NEW.monto_aprobado
      )
    END
  ))
  RETURNING batch_id INTO v_batch_id;

  -- Programar procesamiento del batch (se ejecutará después de 2 segundos de inactividad)
  -- Por ahora, procesar inmediatamente si es el primer cambio
  PERFORM pg_sleep(0.1); -- Esperar 100ms por si vienen más cambios

  -- Verificar si llegaron más cambios
  SELECT COUNT(*) > 1 FROM jsonb_array_elements(
    (SELECT cambios FROM batch_cambios_temp WHERE batch_id = v_batch_id)
  ) INTO v_batch_exists;

  -- Si solo hay 1 cambio y pasaron 100ms, procesar
  -- Si hay múltiples, esperar a que termine el batch

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 4: Función para procesar batch completo y crear snapshot
CREATE OR REPLACE FUNCTION procesar_batch_snapshot()
RETURNS void AS $$
DECLARE
  v_batch RECORD;
  v_negociacion_id UUID;
  v_current_version INTEGER;
  v_new_version INTEGER;
  v_tipo_cambio TEXT;
  v_razon_cambio TEXT;
  v_fuentes_activas JSONB;
  v_documentos JSONB;
  v_datos_negociacion JSONB;
  v_cambios_agregadas INTEGER;
  v_cambios_eliminadas INTEGER;
  v_cambios_modificadas INTEGER;
BEGIN
  -- Procesar batches antiguos (más de 2 segundos)
  FOR v_batch IN
    SELECT * FROM batch_cambios_temp
    WHERE created_at < NOW() - INTERVAL '2 seconds'
  LOOP
    v_negociacion_id := v_batch.negociacion_id;

    -- Contar tipos de cambios
    SELECT
      COUNT(*) FILTER (WHERE (elem->>'tipo') = 'agregada'),
      COUNT(*) FILTER (WHERE (elem->>'tipo') = 'eliminada'),
      COUNT(*) FILTER (WHERE (elem->>'tipo') = 'modificada')
    INTO v_cambios_agregadas, v_cambios_eliminadas, v_cambios_modificadas
    FROM jsonb_array_elements(v_batch.cambios) AS elem;

    -- Construir razón del cambio
    v_razon_cambio := '';
    IF v_cambios_agregadas > 0 THEN
      v_razon_cambio := v_razon_cambio || v_cambios_agregadas || ' fuente(s) agregada(s)';
    END IF;
    IF v_cambios_eliminadas > 0 THEN
      IF v_razon_cambio != '' THEN v_razon_cambio := v_razon_cambio || ', '; END IF;
      v_razon_cambio := v_razon_cambio || v_cambios_eliminadas || ' fuente(s) eliminada(s)';
    END IF;
    IF v_cambios_modificadas > 0 THEN
      IF v_razon_cambio != '' THEN v_razon_cambio := v_razon_cambio || ', '; END IF;
      v_razon_cambio := v_razon_cambio || v_cambios_modificadas || ' fuente(s) modificada(s)';
    END IF;

    -- Obtener versión actual
    SELECT COALESCE(version_actual, 0) INTO v_current_version
    FROM negociaciones
    WHERE id = v_negociacion_id;

    v_new_version := v_current_version + 1;

    -- Obtener fuentes activas
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', fp.id,
        'tipo', fp.tipo,
        'entidad', fp.entidad,
        'monto_aprobado', fp.monto_aprobado,
        'monto_recibido', fp.monto_recibido,
        'estado', fp.estado_fuente
      )
      ORDER BY fp.created_at
    ), '[]'::jsonb)
    INTO v_fuentes_activas
    FROM fuentes_pago fp
    WHERE fp.negociacion_id = v_negociacion_id
      AND fp.estado_fuente = 'activa';

    -- Obtener documentos
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', d.id,
        'titulo', d.titulo,
        'categoria', d.categoria
      )
      ORDER BY d.created_at
    ), '[]'::jsonb)
    INTO v_documentos
    FROM documentos_proyecto d
    WHERE d.negociacion_id = v_negociacion_id;

    -- Obtener datos de negociación
    SELECT to_jsonb(n.*) INTO v_datos_negociacion
    FROM negociaciones n
    WHERE n.id = v_negociacion_id;

    -- Crear snapshot con batch_id
    INSERT INTO negociaciones_historial (
      negociacion_id,
      version,
      tipo_cambio,
      razon_cambio,
      usuario_id,
      datos_negociacion,
      fuentes_pago_snapshot,
      documentos_snapshot,
      datos_anteriores,
      datos_nuevos,
      campos_modificados,
      batch_id
    ) VALUES (
      v_negociacion_id,
      v_new_version,
      'fuentes_pago_batch',
      v_razon_cambio,
      auth.uid(),
      v_datos_negociacion,
      v_fuentes_activas,
      v_documentos,
      NULL, -- No hay anterior/nuevo en batch
      v_batch.cambios, -- Guardar todos los cambios del batch
      ARRAY['fuentes_pago'],
      v_batch.batch_id
    );

    -- Actualizar versión en negociaciones
    UPDATE negociaciones
    SET
      version_actual = v_new_version,
      version_lock = version_lock + 1,
      updated_at = NOW()
    WHERE id = v_negociacion_id;

    -- Eliminar batch procesado
    DELETE FROM batch_cambios_temp WHERE batch_id = v_batch.batch_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 5: Reemplazar trigger existente
DROP TRIGGER IF EXISTS trigger_snapshot_fuentes_pago ON fuentes_pago;

CREATE TRIGGER trigger_snapshot_fuentes_pago_batch
  AFTER INSERT OR UPDATE OR DELETE ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION crear_snapshot_batch_fuentes();

-- Paso 6: Crear job para procesar batches pendientes (simulación con función)
-- En producción, esto sería un cron job o background worker
-- Por ahora, se llamará manualmente después de cada actualización

COMMENT ON FUNCTION procesar_batch_snapshot() IS 'Procesar batches de cambios en fuentes de pago y crear snapshots agrupados. Llamar después de actualizaciones masivas.';
COMMENT ON FUNCTION crear_snapshot_batch_fuentes() IS 'Agrupa cambios en fuentes_pago en batches para crear una sola versión por grupo de operaciones.';
