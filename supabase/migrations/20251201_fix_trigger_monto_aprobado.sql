-- ============================================
-- FIX: Corregir trigger para usar monto_aprobado en lugar de monto
-- ============================================
-- Fecha: 2025-12-01
-- Problema: El trigger usaba NEW.monto que no existe, debe ser NEW.monto_aprobado
-- ============================================

CREATE OR REPLACE FUNCTION crear_documento_pendiente_si_falta_carta()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_tipo_doc TEXT;
BEGIN
  -- Solo para INSERT de fuentes que requieren carta
  IF TG_OP = 'INSERT' AND NEW.tipo IN ('Crédito Hipotecario', 'Subsidio Mi Casa Ya', 'Subsidio Caja Compensación') THEN

    -- Si NO tiene carta → crear pendiente
    IF NEW.carta_aprobacion_url IS NULL THEN

      -- Obtener cliente_id desde negociacion
      SELECT n.cliente_id INTO v_cliente_id
      FROM negociaciones n
      WHERE n.id = NEW.negociacion_id;

      -- Generar nombre descriptivo
      v_tipo_doc := CASE NEW.tipo
        WHEN 'Crédito Hipotecario' THEN 'Carta Aprobación Crédito Hipotecario'
        WHEN 'Subsidio Mi Casa Ya' THEN 'Carta Aprobación Subsidio Mi Casa Ya'
        WHEN 'Subsidio Caja Compensación' THEN 'Carta Aprobación Subsidio Caja'
      END;

      IF NEW.entidad IS NOT NULL THEN
        v_tipo_doc := v_tipo_doc || ' - ' || NEW.entidad;
      END IF;

      -- Insertar pendiente
      INSERT INTO documentos_pendientes (
        fuente_pago_id,
        cliente_id,
        tipo_documento,
        categoria_id, -- ID fijo de "Cartas de Aprobación"
        metadata,
        prioridad
      ) VALUES (
        NEW.id,
        v_cliente_id,
        v_tipo_doc,
        '4898e798-c188-4f02-bfcf-b2b15be48e34', -- ID de categoría "Cartas Aprobación"
        jsonb_build_object(
          'tipo_fuente', NEW.tipo,
          'entidad', COALESCE(NEW.entidad, ''),
          'monto_aprobado', NEW.monto_aprobado  -- ✅ CORREGIDO: era NEW.monto
        ),
        'Alta' -- Prioridad alta porque bloquea completitud
      );

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ✅ Trigger ya existe, solo reemplazamos la función
