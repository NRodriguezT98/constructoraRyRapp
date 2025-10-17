-- =====================================================
-- MÓDULO DE NEGOCIACIONES (SIN TABLA CLIENTES)
-- La tabla clientes se migra por separado
-- =====================================================

-- =====================================================
-- TABLA: negociaciones
-- Vincula Cliente + Vivienda + Cierre Financiero
-- =====================================================
CREATE TABLE IF NOT EXISTS public.negociaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  vivienda_id UUID REFERENCES public.viviendas(id) ON DELETE RESTRICT NOT NULL,

  -- Estado de la Negociación
  estado VARCHAR(30) CHECK (estado IN (
    'En Proceso',           -- Aún negociando
    'Cierre Financiero',    -- Completando cierre
    'Activa',              -- Todo OK, recibiendo abonos
    'Completada',          -- Vivienda pagada 100%
    'Cancelada',           -- No se concretó
    'Renuncia'             -- Cliente renunció
  )) DEFAULT 'En Proceso' NOT NULL,

  -- Valores Financieros
  valor_negociado DECIMAL(15,2) NOT NULL,
  descuento_aplicado DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) GENERATED ALWAYS AS (valor_negociado - descuento_aplicado) STORED,

  -- Totales Calculados (se actualizan con triggers)
  total_fuentes_pago DECIMAL(15,2) DEFAULT 0,
  total_abonado DECIMAL(15,2) DEFAULT 0,
  saldo_pendiente DECIMAL(15,2) DEFAULT 0,
  porcentaje_pagado DECIMAL(5,2) DEFAULT 0,

  -- Fechas Clave
  fecha_negociacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_cierre_financiero TIMESTAMP WITH TIME ZONE,
  fecha_activacion TIMESTAMP WITH TIME ZONE,
  fecha_completada TIMESTAMP WITH TIME ZONE,
  fecha_cancelacion TIMESTAMP WITH TIME ZONE,

  -- Motivos
  motivo_cancelacion TEXT,

  -- Documentos
  promesa_compraventa_url TEXT,
  promesa_firmada_url TEXT,
  evidencia_envio_correo_url TEXT,
  escritura_url TEXT,
  otros_documentos JSONB,

  -- Notas
  notas TEXT,

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_creacion UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT negociaciones_cliente_vivienda_unica UNIQUE(cliente_id, vivienda_id),
  CONSTRAINT negociaciones_valor_positivo CHECK (valor_negociado > 0),
  CONSTRAINT negociaciones_descuento_valido CHECK (descuento_aplicado >= 0 AND descuento_aplicado < valor_negociado)
);

CREATE INDEX IF NOT EXISTS idx_negociaciones_cliente ON public.negociaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_negociaciones_vivienda ON public.negociaciones(vivienda_id);
CREATE INDEX IF NOT EXISTS idx_negociaciones_estado ON public.negociaciones(estado);
CREATE INDEX IF NOT EXISTS idx_negociaciones_fecha_creacion ON public.negociaciones(fecha_creacion DESC);

-- =====================================================
-- TABLA: fuentes_pago
-- =====================================================
CREATE TABLE IF NOT EXISTS public.fuentes_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  negociacion_id UUID REFERENCES public.negociaciones(id) ON DELETE CASCADE NOT NULL,

  tipo VARCHAR(50) CHECK (tipo IN (
    'Cuota Inicial',
    'Crédito Hipotecario',
    'Subsidio Mi Casa Ya',
    'Subsidio Caja Compensación'
  )) NOT NULL,

  monto_aprobado DECIMAL(15,2) NOT NULL,
  monto_recibido DECIMAL(15,2) DEFAULT 0,
  saldo_pendiente DECIMAL(15,2) GENERATED ALWAYS AS (monto_aprobado - monto_recibido) STORED,
  porcentaje_completado DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN monto_aprobado > 0 THEN (monto_recibido / monto_aprobado) * 100
      ELSE 0
    END
  ) STORED,

  entidad VARCHAR(100),
  numero_referencia VARCHAR(50),
  permite_multiples_abonos BOOLEAN DEFAULT false NOT NULL,

  carta_aprobacion_url TEXT,
  carta_asignacion_url TEXT,

  estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'En Proceso', 'Completada')) DEFAULT 'Pendiente' NOT NULL,
  fecha_completado TIMESTAMP WITH TIME ZONE,

  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT fuentes_pago_monto_positivo CHECK (monto_aprobado > 0),
  CONSTRAINT fuentes_pago_recibido_valido CHECK (monto_recibido >= 0 AND monto_recibido <= monto_aprobado)
);

CREATE INDEX IF NOT EXISTS idx_fuentes_pago_negociacion ON public.fuentes_pago(negociacion_id);
CREATE INDEX IF NOT EXISTS idx_fuentes_pago_tipo ON public.fuentes_pago(tipo);
CREATE INDEX IF NOT EXISTS idx_fuentes_pago_estado ON public.fuentes_pago(estado);

-- =====================================================
-- TABLA: procesos_negociacion
-- =====================================================
CREATE TABLE IF NOT EXISTS public.procesos_negociacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  negociacion_id UUID REFERENCES public.negociaciones(id) ON DELETE CASCADE NOT NULL,

  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  orden INT NOT NULL DEFAULT 1,

  es_obligatorio BOOLEAN DEFAULT true NOT NULL,
  permite_omitir BOOLEAN DEFAULT false NOT NULL,

  estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado', 'Omitido')) DEFAULT 'Pendiente' NOT NULL,

  depende_de UUID[],

  documentos_requeridos JSONB,
  documentos_urls JSONB,

  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  fecha_limite TIMESTAMP WITH TIME ZONE,

  notas TEXT,
  motivo_omision TEXT,

  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_completo UUID REFERENCES auth.users(id),

  CONSTRAINT procesos_negociacion_orden_positivo CHECK (orden > 0)
);

CREATE INDEX IF NOT EXISTS idx_procesos_negociacion_negociacion ON public.procesos_negociacion(negociacion_id);
CREATE INDEX IF NOT EXISTS idx_procesos_negociacion_estado ON public.procesos_negociacion(estado);
CREATE INDEX IF NOT EXISTS idx_procesos_negociacion_orden ON public.procesos_negociacion(negociacion_id, orden);

-- =====================================================
-- TABLA: plantillas_proceso
-- =====================================================
CREATE TABLE IF NOT EXISTS public.plantillas_proceso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  pasos JSONB NOT NULL,

  activo BOOLEAN DEFAULT true NOT NULL,
  es_predeterminado BOOLEAN DEFAULT false NOT NULL,

  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_creacion UUID REFERENCES auth.users(id)
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: fecha_actualizacion en negociaciones
CREATE OR REPLACE FUNCTION update_negociaciones_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_negociaciones_fecha_actualizacion ON public.negociaciones;
CREATE TRIGGER trigger_update_negociaciones_fecha_actualizacion
  BEFORE UPDATE ON public.negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_negociaciones_fecha_actualizacion();

-- Trigger: actualizar totales en negociaciones
CREATE OR REPLACE FUNCTION update_negociaciones_totales()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.negociaciones
  SET
    total_fuentes_pago = (
      SELECT COALESCE(SUM(monto_aprobado), 0)
      FROM public.fuentes_pago
      WHERE negociacion_id = COALESCE(NEW.negociacion_id, OLD.negociacion_id)
    ),
    total_abonado = (
      SELECT COALESCE(SUM(monto_recibido), 0)
      FROM public.fuentes_pago
      WHERE negociacion_id = COALESCE(NEW.negociacion_id, OLD.negociacion_id)
    )
  WHERE id = COALESCE(NEW.negociacion_id, OLD.negociacion_id);

  UPDATE public.negociaciones
  SET
    saldo_pendiente = valor_total - total_abonado,
    porcentaje_pagado = CASE
      WHEN valor_total > 0 THEN (total_abonado / valor_total) * 100
      ELSE 0
    END
  WHERE id = COALESCE(NEW.negociacion_id, OLD.negociacion_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_negociaciones_totales_insert ON public.fuentes_pago;
DROP TRIGGER IF EXISTS trigger_update_negociaciones_totales_update ON public.fuentes_pago;
DROP TRIGGER IF EXISTS trigger_update_negociaciones_totales_delete ON public.fuentes_pago;

CREATE TRIGGER trigger_update_negociaciones_totales_insert
  AFTER INSERT ON public.fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION update_negociaciones_totales();

CREATE TRIGGER trigger_update_negociaciones_totales_update
  AFTER UPDATE ON public.fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION update_negociaciones_totales();

CREATE TRIGGER trigger_update_negociaciones_totales_delete
  AFTER DELETE ON public.fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION update_negociaciones_totales();

-- Trigger: cambiar estado del cliente cuando negociación pasa a Activa
CREATE OR REPLACE FUNCTION update_cliente_estado_on_negociacion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'Activa' AND (OLD IS NULL OR OLD.estado != 'Activa') THEN
    UPDATE public.clientes
    SET estado = 'Activo'
    WHERE id = NEW.cliente_id AND estado = 'Interesado';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cliente_estado_on_negociacion ON public.negociaciones;
CREATE TRIGGER trigger_update_cliente_estado_on_negociacion
  AFTER INSERT OR UPDATE ON public.negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_cliente_estado_on_negociacion();

-- =====================================================
-- VISTAS
-- =====================================================

DROP VIEW IF EXISTS public.vista_clientes_resumen CASCADE;
CREATE OR REPLACE VIEW public.vista_clientes_resumen AS
SELECT
  c.id,
  c.nombre_completo,
  c.tipo_documento,
  c.numero_documento,
  c.telefono,
  c.email,
  c.estado,
  c.origen,
  c.fecha_creacion,
  COUNT(n.id) as total_negociaciones,
  COUNT(CASE WHEN n.estado = 'Activa' THEN 1 END) as negociaciones_activas,
  COUNT(CASE WHEN n.estado = 'Completada' THEN 1 END) as negociaciones_completadas,
  MAX(n.fecha_creacion) as ultima_negociacion
FROM public.clientes c
LEFT JOIN public.negociaciones n ON c.id = n.cliente_id
GROUP BY c.id;

DROP VIEW IF EXISTS public.vista_negociaciones_completas CASCADE;
CREATE OR REPLACE VIEW public.vista_negociaciones_completas AS
SELECT
  n.id,
  n.estado,
  n.valor_total,
  n.total_fuentes_pago,
  n.total_abonado,
  n.saldo_pendiente,
  n.porcentaje_pagado,
  n.fecha_negociacion,
  n.fecha_cierre_financiero,

  c.id as cliente_id,
  c.nombre_completo as cliente_nombre,
  c.numero_documento as cliente_documento,
  c.telefono as cliente_telefono,
  c.email as cliente_email,

  v.id as vivienda_id,
  v.numero as vivienda_numero,
  v.tipo_vivienda,
  v.valor_total as vivienda_valor_original,

  m.nombre as manzana_nombre,
  p.nombre as proyecto_nombre

FROM public.negociaciones n
INNER JOIN public.clientes c ON n.cliente_id = c.id
INNER JOIN public.viviendas v ON n.vivienda_id = v.id
LEFT JOIN public.manzanas m ON v.manzana_id = m.id
LEFT JOIN public.proyectos p ON m.proyecto_id = p.id;

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE public.negociaciones IS 'Vincula cliente con vivienda y gestiona el cierre financiero';
COMMENT ON TABLE public.fuentes_pago IS 'Fuentes de financiamiento para cada negociación';
COMMENT ON TABLE public.procesos_negociacion IS 'Workflow/hitos de cada negociación';
COMMENT ON TABLE public.plantillas_proceso IS 'Plantillas reutilizables para procesos estándar';

COMMENT ON COLUMN public.negociaciones.estado IS 'En Proceso → Cierre Financiero → Activa → Completada/Cancelada/Renuncia';
COMMENT ON COLUMN public.fuentes_pago.permite_multiples_abonos IS 'true para Cuota Inicial, false para créditos y subsidios (pago único)';
