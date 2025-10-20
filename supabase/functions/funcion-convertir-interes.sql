-- =====================================================
-- FUNCIÓN: Convertir interés en negociación formal
-- =====================================================

CREATE OR REPLACE FUNCTION convertir_interes_a_negociacion(
  p_interes_id UUID,
  p_valor_negociado DECIMAL,
  p_descuento DECIMAL DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_interes RECORD;
  v_negociacion_id UUID;
BEGIN
  -- Obtener datos del interés
  SELECT * INTO v_interes
  FROM cliente_intereses
  WHERE id = p_interes_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Interés no encontrado';
  END IF;

  IF v_interes.estado = 'Negociación' THEN
    RAISE EXCEPTION 'Este interés ya fue convertido a negociación';
  END IF;

  -- Crear la negociación
  INSERT INTO negociaciones (
    cliente_id,
    vivienda_id,
    valor_negociado,
    descuento_aplicado,
    estado,
    notas
  ) VALUES (
    v_interes.cliente_id,
    v_interes.vivienda_id,
    p_valor_negociado,
    p_descuento,
    'En Proceso',
    COALESCE('Convertido desde interés: ' || v_interes.notas, 'Convertido desde interés')
  )
  RETURNING id INTO v_negociacion_id;

  -- Actualizar el interés
  UPDATE cliente_intereses
  SET
    estado = 'Negociación',
    negociacion_id = v_negociacion_id,
    fecha_conversion = NOW(),
    fecha_actualizacion = NOW()
  WHERE id = p_interes_id;

  RETURN v_negociacion_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTARIO DE LA FUNCIÓN
-- =====================================================
COMMENT ON FUNCTION convertir_interes_a_negociacion IS
  'Convierte un interés de cliente en una negociación formal. Crea el registro en negociaciones y actualiza el interés.';

-- =====================================================
-- PRUEBA (OPCIONAL - Descomentar para probar)
-- =====================================================
/*
-- Obtener un interés de prueba
SELECT id, cliente_id, vivienda_id, estado
FROM cliente_intereses
WHERE estado IN ('Activo', 'Pendiente', 'Contactado')
LIMIT 1;

-- Convertirlo (reemplaza el UUID con el ID del paso anterior)
SELECT convertir_interes_a_negociacion(
  'UUID-DEL-INTERES',  -- Reemplazar con ID real
  120000000,           -- Valor negociado
  5000000              -- Descuento (opcional)
);

-- Verificar que se creó la negociación y se actualizó el interés
SELECT * FROM cliente_intereses WHERE id = 'UUID-DEL-INTERES';
SELECT * FROM negociaciones WHERE cliente_id = (
  SELECT cliente_id FROM cliente_intereses WHERE id = 'UUID-DEL-INTERES'
) ORDER BY fecha_creacion DESC LIMIT 1;
*/

-- =====================================================
-- ✅ EJECUTAR EN SUPABASE DASHBOARD → SQL EDITOR
-- =====================================================
