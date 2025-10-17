-- =====================================================
-- TABLA: cliente_intereses
-- Sistema de seguimiento de interés de clientes en proyectos/viviendas
-- Permite historial completo y múltiples intereses simultáneos
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cliente_intereses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  vivienda_id UUID REFERENCES public.viviendas(id) ON DELETE SET NULL, -- Opcional: casa específica

  -- Información del interés
  notas TEXT, -- Comentarios sobre qué le interesa, presupuesto, etc.

  -- Estado del interés
  estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Descartado', 'Convertido')),
  motivo_descarte TEXT, -- Si estado = 'Descartado', por qué lo descartó

  -- Auditoría
  fecha_interes TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_creacion UUID REFERENCES auth.users(id),

  -- Constraint: Un cliente no puede tener el mismo interés activo duplicado
  CONSTRAINT interes_unico UNIQUE(cliente_id, proyecto_id, vivienda_id, estado)
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_intereses_cliente_id ON public.cliente_intereses(cliente_id);
CREATE INDEX IF NOT EXISTS idx_intereses_proyecto_id ON public.cliente_intereses(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_intereses_vivienda_id ON public.cliente_intereses(vivienda_id);
CREATE INDEX IF NOT EXISTS idx_intereses_estado ON public.cliente_intereses(estado);
CREATE INDEX IF NOT EXISTS idx_intereses_fecha ON public.cliente_intereses(fecha_interes DESC);

-- Índice compuesto para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_intereses_cliente_estado
  ON public.cliente_intereses(cliente_id, estado);

-- =====================================================
-- TRIGGER: Actualizar fecha_actualizacion
-- =====================================================
CREATE TRIGGER update_cliente_intereses_fecha_actualizacion
  BEFORE UPDATE ON public.cliente_intereses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE public.cliente_intereses ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver intereses de clientes (público para todos los usuarios autenticados)
CREATE POLICY "Permitir lectura de intereses a usuarios autenticados"
  ON public.cliente_intereses FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Los usuarios pueden crear intereses
CREATE POLICY "Permitir creación de intereses a usuarios autenticados"
  ON public.cliente_intereses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Los usuarios pueden actualizar intereses
CREATE POLICY "Permitir actualización de intereses a usuarios autenticados"
  ON public.cliente_intereses FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Los usuarios pueden eliminar intereses
CREATE POLICY "Permitir eliminación de intereses a usuarios autenticados"
  ON public.cliente_intereses FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- VISTA: intereses_completos
-- Join con datos de cliente, proyecto y vivienda
-- =====================================================
CREATE OR REPLACE VIEW public.intereses_completos AS
SELECT
  -- Interés
  i.id,
  i.cliente_id,
  i.proyecto_id,
  i.vivienda_id,
  i.notas,
  i.estado as estado_interes,
  i.motivo_descarte,
  i.fecha_interes,
  i.fecha_actualizacion,

  -- Cliente
  c.nombre_completo as cliente_nombre,
  c.telefono as cliente_telefono,
  c.email as cliente_email,
  c.estado as estado_cliente,

  -- Proyecto
  p.nombre as proyecto_nombre,
  p.ubicacion as proyecto_ubicacion,

  -- Vivienda (si está especificada)
  v.numero as vivienda_numero,
  v.estado as vivienda_estado,
  v.precio as vivienda_precio,

  -- Manzana (si hay vivienda)
  m.nombre as manzana_nombre

FROM public.cliente_intereses i
INNER JOIN public.clientes c ON i.cliente_id = c.id
INNER JOIN public.proyectos p ON i.proyecto_id = p.id
LEFT JOIN public.viviendas v ON i.vivienda_id = v.id
LEFT JOIN public.manzanas m ON v.manzana_id = m.id;

-- =====================================================
-- FUNCIÓN: Registrar interés automáticamente al crear cliente
-- Opción: usar en trigger o llamar manualmente
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_interes_inicial(
  p_cliente_id UUID,
  p_proyecto_id UUID,
  p_vivienda_id UUID DEFAULT NULL,
  p_notas TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_interes_id UUID;
BEGIN
  INSERT INTO public.cliente_intereses (
    cliente_id,
    proyecto_id,
    vivienda_id,
    notas,
    estado
  ) VALUES (
    p_cliente_id,
    p_proyecto_id,
    p_vivienda_id,
    p_notas,
    'Activo'
  )
  RETURNING id INTO v_interes_id;

  RETURN v_interes_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Marcar interés como convertido al asignar vivienda
-- =====================================================
CREATE OR REPLACE FUNCTION marcar_interes_convertido(
  p_cliente_id UUID,
  p_vivienda_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Marcar como Convertido todos los intereses activos del cliente en esa vivienda
  UPDATE public.cliente_intereses
  SET
    estado = 'Convertido',
    fecha_actualizacion = NOW()
  WHERE
    cliente_id = p_cliente_id
    AND vivienda_id = p_vivienda_id
    AND estado = 'Activo';

  -- Opcional: Marcar otros intereses activos del cliente como Descartados
  UPDATE public.cliente_intereses
  SET
    estado = 'Descartado',
    motivo_descarte = 'Cliente adquirió otra vivienda',
    fecha_actualizacion = NOW()
  WHERE
    cliente_id = p_cliente_id
    AND estado = 'Activo'
    AND vivienda_id != p_vivienda_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE public.cliente_intereses IS 'Historial de intereses de clientes en proyectos/viviendas';
COMMENT ON COLUMN public.cliente_intereses.estado IS 'Activo: interés vigente | Descartado: cliente ya no interesado | Convertido: se concretó la venta';
COMMENT ON FUNCTION registrar_interes_inicial IS 'Registra el interés inicial de un cliente al ser creado';
COMMENT ON FUNCTION marcar_interes_convertido IS 'Marca interés como convertido cuando se asigna vivienda al cliente';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ver estructura
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'cliente_intereses' ORDER BY ordinal_position;

-- Probar función de registro
-- SELECT registrar_interes_inicial(
--   'uuid-del-cliente',
--   'uuid-del-proyecto',
--   NULL,
--   'Interesado en casa de 2 pisos'
-- );

-- Ver intereses completos
-- SELECT * FROM intereses_completos WHERE estado_interes = 'Activo';
