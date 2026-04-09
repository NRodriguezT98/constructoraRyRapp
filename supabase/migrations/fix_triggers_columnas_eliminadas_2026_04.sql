-- Fix aplicado: 2026-04-09
-- Razón: La limpieza LIMPIEZA-AUDITORIA-2026-04.sql eliminó dos columnas
-- que los triggers de historial seguían referenciando:
--
--   1. negociaciones.fecha_ultima_modificacion
--      → incrementar_version_lock() hacía NEW.fecha_ultima_modificacion := NOW()
--      → causa: INSERT fuentes_pago → UPDATE negociaciones → BEFORE trigger → CRASH
--
--   2. documentos_cliente.estado_documento
--      → crear_snapshot_negociacion() filtraba por d.estado_documento = 'activo'
--      → crear_snapshot_por_cambio_fuente() hacía lo mismo
--
-- Solución: Reemplazar las tres funciones sin las referencias eliminadas.

-- ============================================================
-- 1. incrementar_version_lock  (BEFORE UPDATE en negociaciones)
--    El culpable raíz del error actual
-- ============================================================
CREATE OR REPLACE FUNCTION incrementar_version_lock()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_lock := OLD.version_lock + 1;
  -- NOTA: fecha_ultima_modificacion fue eliminada en LIMPIEZA-AUDITORIA-2026-04
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. crear_snapshot_negociacion  (BEFORE UPDATE en negociaciones)
--    Eliminar filtro por estado_documento (columna eliminada)
-- ============================================================
CREATE OR REPLACE FUNCTION crear_snapshot_negociacion()
RETURNS TRIGGER AS $$
DECLARE
  v_fuentes JSONB;
  v_documentos JSONB;
  v_campos_modificados TEXT[];
  v_tipo_cambio VARCHAR(100);
BEGIN
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

    -- Obtener documentos del cliente
    -- NOTA: estado_documento fue eliminado en LIMPIEZA-AUDITORIA-2026-04
    SELECT COALESCE(jsonb_agg(to_jsonb(d)), '[]'::jsonb)
    INTO v_documentos
    FROM documentos_cliente d
    WHERE d.cliente_id = NEW.cliente_id;

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
      COALESCE(NEW.notas, 'Modificación de negociación'),
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

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. crear_snapshot_por_cambio_fuente  (AFTER INSERT/UPDATE/DELETE en fuentes_pago)
--    Eliminar: fecha_ultima_modificacion del UPDATE negociaciones
--    Eliminar: filtro estado_documento en documentos_cliente
-- ============================================================
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
  SELECT * INTO v_negociacion
  FROM negociaciones
  WHERE id = COALESCE(NEW.negociacion_id, OLD.negociacion_id);

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

  -- Incrementar version_lock
  -- NOTA: fecha_ultima_modificacion fue eliminada en LIMPIEZA-AUDITORIA-2026-04
  UPDATE negociaciones
  SET version_lock = version_lock + 1
  WHERE id = v_negociacion.id
  RETURNING version_lock INTO v_version_nueva;

  -- Fuentes activas actuales
  SELECT COALESCE(jsonb_agg(to_jsonb(f)), '[]'::jsonb)
  INTO v_fuentes
  FROM fuentes_pago f
  WHERE f.negociacion_id = v_negociacion.id
    AND f.estado_fuente = 'activa';

  -- Documentos del cliente
  -- NOTA: estado_documento fue eliminado en LIMPIEZA-AUDITORIA-2026-04
  SELECT COALESCE(jsonb_agg(to_jsonb(d)), '[]'::jsonb)
  INTO v_documentos
  FROM documentos_cliente d
  WHERE d.cliente_id = v_negociacion.cliente_id;

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

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;
