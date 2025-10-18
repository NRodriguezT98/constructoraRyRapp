-- =====================================================
-- NUEVA TABLA: intereses_clientes
-- =====================================================
-- Registra el historial de intereses de clientes
-- ANTES de convertirse en negociaciones formales
-- =====================================================

CREATE TABLE IF NOT EXISTS intereses_clientes (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencias
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
  vivienda_id UUID REFERENCES viviendas(id) ON DELETE RESTRICT NOT NULL,
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE RESTRICT NOT NULL,

  -- Estado del interés
  estado VARCHAR(30) CHECK (estado IN (
    'Pendiente',        -- Acaba de expresar interés
    'Contactado',       -- Ya se contactó al cliente
    'En Seguimiento',   -- En proceso de seguimiento
    'Negociación',      -- Se convirtió en negociación formal (crear registro en negociaciones)
    'Descartado',       -- Cliente ya no está interesado
    'Perdido'           -- No se logró contactar o perdió interés
  )) DEFAULT 'Pendiente' NOT NULL,

  -- Información del interés
  valor_estimado DECIMAL(15,2),  -- Valor que el cliente esperaba/preguntó
  notas TEXT,                     -- Observaciones del vendedor

  -- Origen del interés
  origen VARCHAR(50) CHECK (origen IN (
    'Visita Presencial',
    'Llamada Telefónica',
    'WhatsApp',
    'Email',
    'Redes Sociales',
    'Referido',
    'Sitio Web',
    'Otro'
  )),

  -- Seguimiento
  prioridad VARCHAR(20) CHECK (prioridad IN ('Alta', 'Media', 'Baja')) DEFAULT 'Media',
  fecha_ultimo_contacto TIMESTAMP WITH TIME ZONE,
  proximo_seguimiento TIMESTAMP WITH TIME ZONE,

  -- Conversión a negociación
  negociacion_id UUID REFERENCES negociaciones(id) ON DELETE SET NULL,
  fecha_conversion TIMESTAMP WITH TIME ZONE,  -- Cuándo se convirtió en negociación

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  creado_por UUID REFERENCES auth.users(id),
  actualizado_por UUID REFERENCES auth.users(id)
);

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

CREATE INDEX idx_intereses_cliente ON intereses_clientes(cliente_id);
CREATE INDEX idx_intereses_vivienda ON intereses_clientes(vivienda_id);
CREATE INDEX idx_intereses_proyecto ON intereses_clientes(proyecto_id);
CREATE INDEX idx_intereses_estado ON intereses_clientes(estado);
CREATE INDEX idx_intereses_fecha_creacion ON intereses_clientes(fecha_creacion DESC);
CREATE INDEX idx_intereses_proximo_seguimiento ON intereses_clientes(proximo_seguimiento)
  WHERE estado IN ('Pendiente', 'Contactado', 'En Seguimiento');

-- =====================================================
-- TRIGGER: Actualizar fecha_actualizacion
-- =====================================================

CREATE OR REPLACE FUNCTION update_intereses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_intereses_timestamp
  BEFORE UPDATE ON intereses_clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_intereses_timestamp();

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

ALTER TABLE intereses_clientes ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden ver todos los intereses
CREATE POLICY "Usuarios autenticados pueden ver intereses"
  ON intereses_clientes
  FOR SELECT
  TO authenticated
  USING (true);

-- Usuarios autenticados pueden crear intereses
CREATE POLICY "Usuarios autenticados pueden crear intereses"
  ON intereses_clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Usuarios autenticados pueden actualizar intereses
CREATE POLICY "Usuarios autenticados pueden actualizar intereses"
  ON intereses_clientes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Usuarios autenticados pueden eliminar intereses
CREATE POLICY "Usuarios autenticados pueden eliminar intereses"
  ON intereses_clientes
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE intereses_clientes IS 'Registro del historial de intereses de clientes en viviendas. Se convierte en negociación cuando se formaliza.';
COMMENT ON COLUMN intereses_clientes.estado IS 'Estado actual del interés del cliente';
COMMENT ON COLUMN intereses_clientes.valor_estimado IS 'Valor aproximado que el cliente mencionó o esperaba';
COMMENT ON COLUMN intereses_clientes.origen IS 'Cómo se originó el contacto/interés';
COMMENT ON COLUMN intereses_clientes.negociacion_id IS 'ID de la negociación si el interés se convirtió en negociación formal';

-- =====================================================
-- VISTA: Intereses con información completa
-- =====================================================

CREATE OR REPLACE VIEW vista_intereses_completa AS
SELECT
  i.id,
  i.estado,
  i.valor_estimado,
  i.notas,
  i.origen,
  i.prioridad,
  i.fecha_creacion,
  i.fecha_ultimo_contacto,
  i.proximo_seguimiento,

  -- Datos del cliente
  c.id as cliente_id,
  c.nombre as cliente_nombre,
  c.apellido as cliente_apellido,
  c.email as cliente_email,
  c.telefono as cliente_telefono,

  -- Datos de la vivienda
  v.id as vivienda_id,
  v.numero as vivienda_numero,
  v.valor_total as vivienda_valor,
  v.estado as vivienda_estado,

  -- Datos de la manzana
  m.nombre as manzana_nombre,

  -- Datos del proyecto
  p.id as proyecto_id,
  p.nombre as proyecto_nombre,

  -- Info de conversión
  i.negociacion_id,
  i.fecha_conversion,

  -- Calculado: días desde el interés
  EXTRACT(DAY FROM NOW() - i.fecha_creacion) as dias_desde_interes,

  -- Calculado: requiere seguimiento urgente
  CASE
    WHEN i.proximo_seguimiento < NOW() AND i.estado IN ('Pendiente', 'Contactado', 'En Seguimiento')
    THEN true
    ELSE false
  END as seguimiento_urgente

FROM intereses_clientes i
INNER JOIN clientes c ON i.cliente_id = c.id
INNER JOIN viviendas v ON i.vivienda_id = v.id
INNER JOIN manzanas m ON v.manzana_id = m.id
INNER JOIN proyectos p ON i.proyecto_id = p.id
ORDER BY i.fecha_creacion DESC;

-- =====================================================
-- FUNCIÓN: Convertir interés en negociación
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
  FROM intereses_clientes
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
    'Convertido desde interés: ' || v_interes.notas
  )
  RETURNING id INTO v_negociacion_id;

  -- Actualizar el interés
  UPDATE intereses_clientes
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
-- DATOS DE EJEMPLO (Opcional - comentar en producción)
-- =====================================================

-- Descomentar para insertar datos de prueba:
/*
INSERT INTO intereses_clientes (
  cliente_id,
  vivienda_id,
  proyecto_id,
  estado,
  valor_estimado,
  notas,
  origen,
  prioridad
)
SELECT
  (SELECT id FROM clientes LIMIT 1),
  (SELECT id FROM viviendas WHERE estado = 'disponible' LIMIT 1),
  (SELECT id FROM proyectos WHERE estado = 'en_construccion' LIMIT 1),
  'Pendiente',
  120000000,
  'Cliente interesado, contactar mañana',
  'WhatsApp',
  'Alta';
*/

-- =====================================================
-- ✅ EJECUTAR ESTE SQL EN SUPABASE DASHBOARD
-- =====================================================
-- Dashboard → SQL Editor → New Query → Pegar → Run
-- =====================================================
