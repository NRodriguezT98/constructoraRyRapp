-- =====================================================
-- MÓDULO DE CLIENTES Y NEGOCIACIONES
-- Sistema desacoplado: Cliente → Negociación → Vivienda
-- =====================================================

-- =====================================================
-- TABLA: clientes
-- Almacena información de clientes (pueden existir sin vivienda)
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información Personal
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  nombre_completo VARCHAR(200) GENERATED ALWAYS AS (nombres || ' ' || apellidos) STORED,

  tipo_documento VARCHAR(10) CHECK (tipo_documento IN ('CC', 'CE', 'TI', 'NIT', 'PP', 'PEP')) NOT NULL DEFAULT 'CC',
  numero_documento VARCHAR(20) NOT NULL,
  fecha_nacimiento DATE,

  -- Contacto
  telefono VARCHAR(20),
  telefono_alternativo VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  ciudad VARCHAR(100) DEFAULT 'Cali',
  departamento VARCHAR(100) DEFAULT 'Valle del Cauca',

  -- Estado del Cliente
  estado VARCHAR(20) CHECK (estado IN ('Interesado', 'Activo', 'Inactivo')) DEFAULT 'Interesado' NOT NULL,

  -- Origen/Fuente (¿Cómo llegó el cliente?)
  origen VARCHAR(50) CHECK (origen IN (
    'Referido',
    'Página Web',
    'Redes Sociales',
    'Llamada Directa',
    'Visita Oficina',
    'Feria/Evento',
    'Publicidad',
    'Otro'
  )),
  referido_por VARCHAR(200), -- Nombre de quien refirió

  -- Documentos
  documento_identidad_url TEXT, -- Fotocopia del documento

  -- Notas y Observaciones
  notas TEXT,

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_creacion UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT clientes_documento_unico UNIQUE(tipo_documento, numero_documento)
);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_numero_documento ON clientes(numero_documento);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_completo ON clientes(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_clientes_fecha_creacion ON clientes(fecha_creacion DESC);

-- =====================================================
-- TABLA: negociaciones
-- Vincula Cliente + Vivienda + Cierre Financiero
-- =====================================================
CREATE TABLE IF NOT EXISTS negociaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
  vivienda_id UUID REFERENCES viviendas(id) ON DELETE RESTRICT NOT NULL,

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
  valor_negociado DECIMAL(15,2) NOT NULL, -- Puede ser diferente al valor_vivienda (descuentos)
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
  fecha_activacion TIMESTAMP WITH TIME ZONE, -- Cuando pasa a 'Activa'
  fecha_completada TIMESTAMP WITH TIME ZONE,
  fecha_cancelacion TIMESTAMP WITH TIME ZONE,

  -- Motivos de Cancelación/Renuncia
  motivo_cancelacion TEXT,

  -- Documentos de la Negociación
  promesa_compraventa_url TEXT,
  promesa_firmada_url TEXT,
  evidencia_envio_correo_url TEXT,
  escritura_url TEXT,
  otros_documentos JSONB, -- Documentos adicionales flexibles

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

-- Índices para negociaciones
CREATE INDEX IF NOT EXISTS idx_negociaciones_cliente ON negociaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_negociaciones_vivienda ON negociaciones(vivienda_id);
CREATE INDEX IF NOT EXISTS idx_negociaciones_estado ON negociaciones(estado);
CREATE INDEX IF NOT EXISTS idx_negociaciones_fecha_creacion ON negociaciones(fecha_creacion DESC);

-- =====================================================
-- TABLA: fuentes_pago
-- Configura las fuentes de pago por negociación
-- =====================================================
CREATE TABLE IF NOT EXISTS fuentes_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relación
  negociacion_id UUID REFERENCES negociaciones(id) ON DELETE CASCADE NOT NULL,

  -- Tipo de Fuente
  tipo VARCHAR(50) CHECK (tipo IN (
    'Cuota Inicial',
    'Crédito Hipotecario',
    'Subsidio Mi Casa Ya',
    'Subsidio Caja Compensación'
  )) NOT NULL,

  -- Montos
  monto_aprobado DECIMAL(15,2) NOT NULL,
  monto_recibido DECIMAL(15,2) DEFAULT 0,
  saldo_pendiente DECIMAL(15,2) GENERATED ALWAYS AS (monto_aprobado - monto_recibido) STORED,
  porcentaje_completado DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN monto_aprobado > 0 THEN (monto_recibido / monto_aprobado) * 100
      ELSE 0
    END
  ) STORED,

  -- Detalles Específicos por Tipo
  entidad VARCHAR(100), -- Nombre del Banco o Caja de Compensación
  numero_referencia VARCHAR(50), -- Radicado/Referencia/Número de crédito

  -- Comportamiento de Pago
  permite_multiples_abonos BOOLEAN DEFAULT false NOT NULL,
  -- true: Cuota Inicial (varios pagos)
  -- false: Crédito, Subsidios (un solo desembolso)

  -- Documentos
  carta_aprobacion_url TEXT, -- Para créditos y subsidios
  carta_asignacion_url TEXT, -- Para subsidio caja compensación

  -- Estado
  estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'En Proceso', 'Completada')) DEFAULT 'Pendiente' NOT NULL,
  fecha_completado TIMESTAMP WITH TIME ZONE,

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT fuentes_pago_monto_positivo CHECK (monto_aprobado > 0),
  CONSTRAINT fuentes_pago_recibido_valido CHECK (monto_recibido >= 0 AND monto_recibido <= monto_aprobado)
);

-- Índices para fuentes_pago
CREATE INDEX IF NOT EXISTS idx_fuentes_pago_negociacion ON fuentes_pago(negociacion_id);
CREATE INDEX IF NOT EXISTS idx_fuentes_pago_tipo ON fuentes_pago(tipo);
CREATE INDEX IF NOT EXISTS idx_fuentes_pago_estado ON fuentes_pago(estado);

-- =====================================================
-- TABLA: procesos_negociacion
-- Sistema de workflow/hitos por negociación
-- =====================================================
CREATE TABLE IF NOT EXISTS procesos_negociacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relación
  negociacion_id UUID REFERENCES negociaciones(id) ON DELETE CASCADE NOT NULL,

  -- Información del Paso
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  orden INT NOT NULL DEFAULT 1,

  -- Configuración
  es_obligatorio BOOLEAN DEFAULT true NOT NULL,
  permite_omitir BOOLEAN DEFAULT false NOT NULL,

  -- Estado
  estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado', 'Omitido')) DEFAULT 'Pendiente' NOT NULL,

  -- Dependencias (JSON con IDs de pasos previos requeridos)
  depende_de UUID[], -- Array de IDs de procesos que deben estar completados

  -- Documentos
  documentos_requeridos JSONB, -- ['promesa_pendiente', 'evidencia_correo']
  documentos_urls JSONB, -- { "promesa_pendiente": "url...", "evidencia_correo": "url..." }

  -- Fechas
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  fecha_limite TIMESTAMP WITH TIME ZONE, -- Opcional: deadline

  -- Notas
  notas TEXT,
  motivo_omision TEXT, -- Si fue omitido, explicar por qué

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_completo UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT procesos_negociacion_orden_positivo CHECK (orden > 0)
);

-- Índices para procesos_negociacion
CREATE INDEX IF NOT EXISTS idx_procesos_negociacion_negociacion ON procesos_negociacion(negociacion_id);
CREATE INDEX IF NOT EXISTS idx_procesos_negociacion_estado ON procesos_negociacion(estado);
CREATE INDEX IF NOT EXISTS idx_procesos_negociacion_orden ON procesos_negociacion(negociacion_id, orden);

-- =====================================================
-- TABLA: plantillas_proceso (Opcional - para reutilizar)
-- Define procesos estándar que se pueden aplicar
-- =====================================================
CREATE TABLE IF NOT EXISTS plantillas_proceso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,

  -- Configuración de pasos (JSON)
  pasos JSONB NOT NULL, -- Array de objetos con estructura del proceso
  /*
    Ejemplo:
    [
      {
        "orden": 1,
        "nombre": "Envío Promesa Compraventa",
        "obligatorio": true,
        "documentos": ["promesa_pendiente", "evidencia_correo"]
      },
      {
        "orden": 2,
        "nombre": "Recepción Promesa Firmada",
        "obligatorio": true,
        "documentos": ["promesa_firmada"],
        "dependeDe": [1]
      }
    ]
  */

  -- Estado
  activo BOOLEAN DEFAULT true NOT NULL,
  es_predeterminado BOOLEAN DEFAULT false NOT NULL,

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_creacion UUID REFERENCES auth.users(id)
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para actualizar fecha_actualizacion en clientes
CREATE OR REPLACE FUNCTION update_clientes_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_clientes_fecha_actualizacion
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_clientes_fecha_actualizacion();

-- Trigger para actualizar fecha_actualizacion en negociaciones
CREATE OR REPLACE FUNCTION update_negociaciones_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_negociaciones_fecha_actualizacion
  BEFORE UPDATE ON negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_negociaciones_fecha_actualizacion();

-- Trigger para actualizar totales en negociaciones cuando cambian fuentes_pago
CREATE OR REPLACE FUNCTION update_negociaciones_totales()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar total_fuentes_pago y total_abonado
  UPDATE negociaciones
  SET
    total_fuentes_pago = (
      SELECT COALESCE(SUM(monto_aprobado), 0)
      FROM fuentes_pago
      WHERE negociacion_id = COALESCE(NEW.negociacion_id, OLD.negociacion_id)
    ),
    total_abonado = (
      SELECT COALESCE(SUM(monto_recibido), 0)
      FROM fuentes_pago
      WHERE negociacion_id = COALESCE(NEW.negociacion_id, OLD.negociacion_id)
    )
  WHERE id = COALESCE(NEW.negociacion_id, OLD.negociacion_id);

  -- Actualizar saldo_pendiente y porcentaje_pagado
  UPDATE negociaciones
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

CREATE TRIGGER trigger_update_negociaciones_totales_insert
  AFTER INSERT ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION update_negociaciones_totales();

CREATE TRIGGER trigger_update_negociaciones_totales_update
  AFTER UPDATE ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION update_negociaciones_totales();

CREATE TRIGGER trigger_update_negociaciones_totales_delete
  AFTER DELETE ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION update_negociaciones_totales();

-- Trigger para cambiar estado del cliente cuando se crea una negociación activa
CREATE OR REPLACE FUNCTION update_cliente_estado_on_negociacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la negociación pasa a 'Activa', cambiar cliente a 'Activo'
  IF NEW.estado = 'Activa' AND (OLD IS NULL OR OLD.estado != 'Activa') THEN
    UPDATE clientes
    SET estado = 'Activo'
    WHERE id = NEW.cliente_id AND estado = 'Interesado';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cliente_estado_on_negociacion
  AFTER INSERT OR UPDATE ON negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_cliente_estado_on_negociacion();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Clientes con sus negociaciones activas
CREATE OR REPLACE VIEW vista_clientes_resumen AS
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
FROM clientes c
LEFT JOIN negociaciones n ON c.id = n.cliente_id
GROUP BY c.id;

-- Vista: Negociaciones completas con información de cliente y vivienda
CREATE OR REPLACE VIEW vista_negociaciones_completas AS
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

  -- Cliente
  c.id as cliente_id,
  c.nombre_completo as cliente_nombre,
  c.numero_documento as cliente_documento,
  c.telefono as cliente_telefono,
  c.email as cliente_email,

  -- Vivienda
  v.id as vivienda_id,
  v.numero as vivienda_numero,
  v.tipo_vivienda,
  v.valor_total as vivienda_valor_original,

  -- Manzana y Proyecto
  m.nombre as manzana_nombre,
  p.nombre as proyecto_nombre

FROM negociaciones n
INNER JOIN clientes c ON n.cliente_id = c.id
INNER JOIN viviendas v ON n.vivienda_id = v.id
LEFT JOIN manzanas m ON v.manzana_id = m.id
LEFT JOIN proyectos p ON m.proyecto_id = p.id;

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================
COMMENT ON TABLE clientes IS 'Clientes del sistema - pueden existir sin vivienda asignada';
COMMENT ON TABLE negociaciones IS 'Vincula cliente con vivienda y gestiona el cierre financiero';
COMMENT ON TABLE fuentes_pago IS 'Fuentes de financiamiento para cada negociación';
COMMENT ON TABLE procesos_negociacion IS 'Workflow/hitos de cada negociación';
COMMENT ON TABLE plantillas_proceso IS 'Plantillas reutilizables para procesos estándar';

COMMENT ON COLUMN clientes.estado IS 'Interesado: Sin negociación | Activo: Con negociación activa | Inactivo: Sin actividad';
COMMENT ON COLUMN negociaciones.estado IS 'En Proceso → Cierre Financiero → Activa → Completada/Cancelada/Renuncia';
COMMENT ON COLUMN fuentes_pago.permite_multiples_abonos IS 'true para Cuota Inicial, false para créditos y subsidios (pago único)';
