-- =============================================================
-- FIX: Funciones que referencian carta_aprobacion_url (columna eliminada)
-- La gestión de documentos (cartas de aprobación) fue migrada
-- al módulo de documentos. La columna ya no existe en fuentes_pago.
-- =============================================================

-- 1. fn_invalidar_carta_por_cambio (trigger BEFORE UPDATE en fuentes_pago)
--    → Causa directa del error 500 al registrar abonos.
--    El trigger trg_invalidar_carta_por_cambio sigue activo pero la función
--    será un no-op ya que documentos se gestionan desde el módulo de documentos.
CREATE OR REPLACE FUNCTION fn_invalidar_carta_por_cambio()
RETURNS TRIGGER AS $$
BEGIN
  -- La columna carta_aprobacion_url ya no existe en fuentes_pago.
  -- La gestión de cartas de aprobación se realiza a través del módulo de documentos.
  -- Si se requiere invalidar documentos vinculados ante cambio de entidad/monto,
  -- ese proceso se maneja desde la capa de aplicación.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. crear_documento_pendiente_si_falta_carta (trigger AFTER INSERT en fuentes_pago)
--    → Simplificar: al insertar una fuente que requiere carta, siempre
--      crear el documento pendiente (ya no existe la condición por carta_aprobacion_url).
CREATE OR REPLACE FUNCTION crear_documento_pendiente_si_falta_carta()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_tipo_doc TEXT;
BEGIN
  -- Solo para INSERT de fuentes que requieren carta
  IF TG_OP = 'INSERT' AND NEW.tipo IN ('Crédito Hipotecario', 'Subsidio Mi Casa Ya', 'Subsidio Caja Compensación') THEN

    -- Obtener cliente_id desde negociacion
    SELECT n.cliente_id INTO v_cliente_id
    FROM negociaciones n
    WHERE n.id = NEW.negociacion_id;

    IF v_cliente_id IS NULL THEN
      -- Sin negociación vinculada, no crear pendiente
      RETURN NEW;
    END IF;

    -- Generar nombre descriptivo
    v_tipo_doc := CASE NEW.tipo
      WHEN 'Crédito Hipotecario' THEN 'Carta Aprobación Crédito Hipotecario'
      WHEN 'Subsidio Mi Casa Ya' THEN 'Carta Aprobación Subsidio Mi Casa Ya'
      WHEN 'Subsidio Caja Compensación' THEN 'Carta Aprobación Subsidio Caja'
    END;

    IF NEW.entidad IS NOT NULL THEN
      v_tipo_doc := v_tipo_doc || ' - ' || NEW.entidad;
    END IF;

    -- Insertar pendiente (siempre: antes se condicionaba a carta_aprobacion_url IS NULL,
    -- pero esa columna fue eliminada; al insertar una nueva fuente nunca hay carta aún)
    INSERT INTO documentos_pendientes (
      fuente_pago_id,
      cliente_id,
      tipo_documento,
      categoria_id,
      metadata,
      prioridad
    ) VALUES (
      NEW.id,
      v_cliente_id,
      v_tipo_doc,
      '4898e798-c188-4f02-bfcf-b2b15be48e34',
      jsonb_build_object(
        'tipo_fuente', NEW.tipo,
        'entidad', COALESCE(NEW.entidad, ''),
        'monto_aprobado', NEW.monto_aprobado
      ),
      'Alta'
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
