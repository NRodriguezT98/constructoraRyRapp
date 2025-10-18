-- =====================================================
-- SCRIPT CONSOLIDADO: Mejorar Sistema de Intereses
-- =====================================================
-- Ejecutar en Supabase Dashboard → SQL Editor
-- =====================================================

-- ========== PASO 1: Agregar columnas faltantes ==========

ALTER TABLE cliente_intereses
  ADD COLUMN IF NOT EXISTS valor_estimado DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS origen VARCHAR(50),
  ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) DEFAULT 'Media',
  ADD COLUMN IF NOT EXISTS fecha_ultimo_contacto TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS proximo_seguimiento TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS negociacion_id UUID REFERENCES negociaciones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fecha_conversion TIMESTAMP WITH TIME ZONE;

-- ========== PASO 2: Actualizar constraints ==========

ALTER TABLE cliente_intereses DROP CONSTRAINT IF EXISTS cliente_intereses_estado_check;
ALTER TABLE cliente_intereses DROP CONSTRAINT IF EXISTS cliente_intereses_origen_check;
ALTER TABLE cliente_intereses DROP CONSTRAINT IF EXISTS cliente_intereses_prioridad_check;

ALTER TABLE cliente_intereses
  ADD CONSTRAINT cliente_intereses_estado_check
  CHECK (estado IN ('Activo', 'Pendiente', 'Contactado', 'En Seguimiento', 'Negociación', 'Descartado', 'Perdido'));

ALTER TABLE cliente_intereses
  ADD CONSTRAINT cliente_intereses_origen_check
  CHECK (origen IN ('Visita Presencial', 'Llamada Telefónica', 'WhatsApp', 'Email', 'Redes Sociales', 'Referido', 'Sitio Web', 'Otro'));

ALTER TABLE cliente_intereses
  ADD CONSTRAINT cliente_intereses_prioridad_check
  CHECK (prioridad IN ('Alta', 'Media', 'Baja'));

-- ========== PASO 3: Crear índices ==========

CREATE INDEX IF NOT EXISTS idx_cliente_intereses_estado ON cliente_intereses(estado);
CREATE INDEX IF NOT EXISTS idx_cliente_intereses_fecha_interes ON cliente_intereses(fecha_interes DESC);
CREATE INDEX IF NOT EXISTS idx_cliente_intereses_prioridad ON cliente_intereses(prioridad);
CREATE INDEX IF NOT EXISTS idx_cliente_intereses_proximo_seguimiento ON cliente_intereses(proximo_seguimiento)
  WHERE estado IN ('Pendiente', 'Contactado', 'En Seguimiento', 'Activo');

-- ========== PASO 4: Actualizar registros existentes ==========

UPDATE cliente_intereses
SET
  prioridad = COALESCE(prioridad, 'Media'),
  origen = COALESCE(origen, 'Otro')
WHERE prioridad IS NULL OR origen IS NULL;

-- ========== PASO 5: Crear función convertir_interes_a_negociacion ==========

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
  SELECT * INTO v_interes FROM cliente_intereses WHERE id = p_interes_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Interés no encontrado';
  END IF;

  IF v_interes.estado = 'Negociación' THEN
    RAISE EXCEPTION 'Este interés ya fue convertido a negociación';
  END IF;

  INSERT INTO negociaciones (
    cliente_id, vivienda_id, valor_negociado, descuento_aplicado, estado, notas
  ) VALUES (
    v_interes.cliente_id, v_interes.vivienda_id, p_valor_negociado, p_descuento, 'En Proceso',
    COALESCE('Convertido desde interés: ' || v_interes.notas, 'Convertido desde interés')
  )
  RETURNING id INTO v_negociacion_id;

  UPDATE cliente_intereses
  SET estado = 'Negociación', negociacion_id = v_negociacion_id,
      fecha_conversion = NOW(), fecha_actualizacion = NOW()
  WHERE id = p_interes_id;

  RETURN v_negociacion_id;
END;
$$ LANGUAGE plpgsql;

-- ========== PASO 6: Actualizar vista intereses_completos ==========

-- Eliminar vista existente primero (puede tener estructura diferente)
DROP VIEW IF EXISTS intereses_completos CASCADE;

-- Crear vista con nueva estructura
CREATE VIEW intereses_completos AS
SELECT
  i.*,
  c.nombres as cliente_nombre, c.apellidos as cliente_apellido, c.nombre_completo,
  c.email as cliente_email, c.telefono as cliente_telefono, c.numero_documento as cliente_documento,
  p.nombre as proyecto_nombre, p.estado as proyecto_estado,
  v.numero as vivienda_numero, v.valor_total as vivienda_valor, v.estado as vivienda_estado,
  m.nombre as manzana_nombre,
  EXTRACT(DAY FROM NOW() - i.fecha_interes) as dias_desde_interes,
  CASE
    WHEN i.proximo_seguimiento < NOW() AND i.estado IN ('Pendiente', 'Contactado', 'En Seguimiento', 'Activo')
    THEN true ELSE false
  END as seguimiento_urgente
FROM cliente_intereses i
INNER JOIN clientes c ON i.cliente_id = c.id
INNER JOIN proyectos p ON i.proyecto_id = p.id
LEFT JOIN viviendas v ON i.vivienda_id = v.id
LEFT JOIN manzanas m ON v.manzana_id = m.id
ORDER BY i.fecha_interes DESC;

-- ========== VERIFICACIÓN FINAL ==========

-- Ver estructura actualizada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cliente_intereses'
ORDER BY ordinal_position;

-- Ver índices
SELECT indexname FROM pg_indexes WHERE tablename = 'cliente_intereses';

-- Ver políticas RLS
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'cliente_intereses';

-- =====================================================
-- ✅ SI TODO SALIÓ BIEN, VERÁS:
-- =====================================================
-- - Columnas nuevas agregadas
-- - Índices creados
-- - Función creada
-- - Vista actualizada
-- - Políticas RLS existentes intactas
-- =====================================================

SELECT '✅ Script ejecutado exitosamente' as resultado;
