-- ================================================
-- FIX: Corregir trigger que usa campo obsoleto tipo_fuente
-- ================================================
-- Fecha: 2025-11-26
-- Descripción: El trigger crear_version_inicial_negociacion usa fp.tipo_fuente
--              cuando el campo correcto es fp.tipo

-- Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS trigger_crear_version_inicial_negociacion ON negociaciones;
DROP FUNCTION IF EXISTS crear_version_inicial_negociacion() CASCADE;

-- Recrear función con el nombre de campo correcto
CREATE OR REPLACE FUNCTION crear_version_inicial_negociacion()
RETURNS TRIGGER AS $$
DECLARE
  v_fuentes_pago JSONB;
BEGIN
  -- Construir array de fuentes de pago desde tabla fuentes_pago
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', fp.id,
        'tipo', fp.tipo,  -- ✅ CORREGIDO: tipo en lugar de tipo_fuente
        'monto_aprobado', fp.monto_aprobado,
        'entidad', fp.entidad,
        'estado', COALESCE(fp.estado, 'Pendiente')
      )
    ),
    '[]'::jsonb
  )
  INTO v_fuentes_pago
  FROM fuentes_pago fp
  WHERE fp.negociacion_id = NEW.id;

  -- Insertar versión inicial
  INSERT INTO negociaciones_versiones (
    negociacion_id,
    version,
    valor_vivienda,
    descuento_aplicado,
    valor_total,
    fuentes_pago,
    motivo_cambio,
    tipo_cambio,
    creado_por
  )
  VALUES (
    NEW.id,
    1, -- Versión inicial
    NEW.valor_negociado,
    NEW.descuento_aplicado,
    NEW.valor_negociado - NEW.descuento_aplicado,
    v_fuentes_pago,
    'Creación de negociación',
    'creacion_inicial', -- ✅ CORREGIDO: valor permitido por check constraint
    auth.uid() -- ✅ Usar auth.uid() en lugar de current_user
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear trigger
CREATE TRIGGER trigger_crear_version_inicial_negociacion
  AFTER INSERT ON negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION crear_version_inicial_negociacion();

COMMENT ON FUNCTION crear_version_inicial_negociacion() IS
'Crea la versión inicial (v1) de una negociación al ser insertada. ✅ CORREGIDO: usa fp.tipo';
