-- =====================================================
-- SISTEMA DE VERSIONES PARA NEGOCIACIONES
-- =====================================================
-- Permite rastrear cambios en fuentes de pago, descuentos
-- y cualquier modificación a lo largo del proceso de venta
-- hasta la firma de la minuta de compraventa.
--
-- Autor: Sistema RyR
-- Fecha: 2025-11-26
-- =====================================================

-- =====================================================
-- 1. TABLA: negociaciones_versiones
-- =====================================================
-- Almacena snapshot completo de cada versión de la negociación
CREATE TABLE IF NOT EXISTS negociaciones_versiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negociacion_id UUID NOT NULL REFERENCES negociaciones(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,

  -- Valores Financieros (snapshot en el momento)
  valor_vivienda NUMERIC(15, 2) NOT NULL,
  descuento_aplicado NUMERIC(15, 2) DEFAULT 0,
  valor_total NUMERIC(15, 2) NOT NULL,

  -- Fuentes de Pago (snapshot como JSONB para flexibilidad)
  fuentes_pago JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Estructura esperada:
  -- [
  --   {
  --     "tipo": "Cuota Inicial",
  --     "monto_aprobado": 20000000,
  --     "entidad": null,
  --     "estado": "Aprobado"
  --   },
  --   {
  --     "tipo": "Crédito Hipotecario",
  --     "monto_aprobado": 80000000,
  --     "entidad": "Bancolombia",
  --     "estado": "Pendiente"
  --   }
  -- ]

  -- Metadata del Cambio
  motivo_cambio TEXT NOT NULL,
  tipo_cambio VARCHAR(50) NOT NULL CHECK (tipo_cambio IN (
    'creacion_inicial',
    'modificacion_fuentes',
    'aplicacion_descuento',
    'ajuste_avaluo',
    'cambio_entidad',
    'otro'
  )),

  -- Auditoría
  es_version_activa BOOLEAN DEFAULT false,
  creado_por UUID REFERENCES auth.users(id),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT version_positiva CHECK (version > 0),
  CONSTRAINT descuento_valido CHECK (descuento_aplicado >= 0),
  CONSTRAINT valor_total_valido CHECK (valor_total > 0),
  CONSTRAINT unica_version_por_negociacion UNIQUE(negociacion_id, version)
);

-- Índices para performance
CREATE INDEX idx_negociaciones_versiones_negociacion ON negociaciones_versiones(negociacion_id);
CREATE INDEX idx_negociaciones_versiones_activa ON negociaciones_versiones(negociacion_id, es_version_activa) WHERE es_version_activa = true;
CREATE INDEX idx_negociaciones_versiones_creado ON negociaciones_versiones(creado_en DESC);

COMMENT ON TABLE negociaciones_versiones IS 'Historial completo de versiones de cada negociación con snapshot de valores y fuentes de pago';
COMMENT ON COLUMN negociaciones_versiones.fuentes_pago IS 'Snapshot JSONB de fuentes de pago en esta versión';
COMMENT ON COLUMN negociaciones_versiones.es_version_activa IS 'Solo UNA versión puede estar activa por negociación';

-- =====================================================
-- 2. TABLA: descuentos_negociacion
-- =====================================================
-- Rastreo específico de descuentos aplicados
CREATE TABLE IF NOT EXISTS descuentos_negociacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negociacion_version_id UUID NOT NULL REFERENCES negociaciones_versiones(id) ON DELETE CASCADE,

  -- Detalles del Descuento
  monto NUMERIC(15, 2) NOT NULL CHECK (monto > 0),
  porcentaje NUMERIC(5, 2), -- Se calculará con trigger

  tipo_descuento VARCHAR(50) NOT NULL CHECK (tipo_descuento IN (
    'inicial',
    'temporal',
    'pre-escritura',
    'referido',
    'otro'
  )),

  motivo TEXT NOT NULL,

  -- Auditoría
  aplicado_por UUID REFERENCES auth.users(id),
  aplicado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_descuentos_version ON descuentos_negociacion(negociacion_version_id);

COMMENT ON TABLE descuentos_negociacion IS 'Rastreo detallado de descuentos aplicados por versión';
COMMENT ON COLUMN descuentos_negociacion.porcentaje IS 'Porcentaje calculado automáticamente por trigger';

-- Trigger para calcular porcentaje automático
CREATE OR REPLACE FUNCTION calcular_porcentaje_descuento()
RETURNS TRIGGER AS $$
DECLARE
  v_valor_vivienda NUMERIC;
BEGIN
  -- Obtener valor de vivienda de la versión
  SELECT valor_vivienda INTO v_valor_vivienda
  FROM negociaciones_versiones
  WHERE id = NEW.negociacion_version_id;

  -- Calcular porcentaje
  IF v_valor_vivienda > 0 THEN
    NEW.porcentaje := (NEW.monto * 100.0) / v_valor_vivienda;
  ELSE
    NEW.porcentaje := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_porcentaje ON descuentos_negociacion;
CREATE TRIGGER trigger_calcular_porcentaje
  BEFORE INSERT OR UPDATE ON descuentos_negociacion
  FOR EACH ROW
  EXECUTE FUNCTION calcular_porcentaje_descuento();

-- =====================================================
-- 3. FUNCIÓN: Crear versión inicial automáticamente
-- =====================================================
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
        'tipo', fp.tipo,
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
    es_version_activa,
    creado_por
  ) VALUES (
    NEW.id,
    1,
    NEW.valor_vivienda,
    COALESCE(NEW.descuento_aplicado, 0),
    NEW.valor_total,
    v_fuentes_pago,
    'Creación inicial de negociación',
    'creacion_inicial',
    true,
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear versión inicial
DROP TRIGGER IF EXISTS trigger_crear_version_inicial ON negociaciones;
CREATE TRIGGER trigger_crear_version_inicial
  AFTER INSERT ON negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION crear_version_inicial_negociacion();

COMMENT ON FUNCTION crear_version_inicial_negociacion IS 'Crea automáticamente versión 1 al insertar negociación';

-- =====================================================
-- 4. FUNCIÓN: Crear nueva versión
-- =====================================================
CREATE OR REPLACE FUNCTION crear_nueva_version_negociacion(
  p_negociacion_id UUID,
  p_valor_vivienda NUMERIC,
  p_descuento_aplicado NUMERIC,
  p_valor_total NUMERIC,
  p_fuentes_pago JSONB,
  p_motivo_cambio TEXT,
  p_tipo_cambio VARCHAR(50)
)
RETURNS UUID AS $$
DECLARE
  v_nueva_version INTEGER;
  v_version_id UUID;
BEGIN
  -- Validar que solo admin puede modificar
  IF NOT EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid()
    AND rol = 'Administrador'
  ) THEN
    RAISE EXCEPTION 'Solo administradores pueden modificar negociaciones';
  END IF;

  -- Obtener siguiente número de versión
  SELECT COALESCE(MAX(version), 0) + 1
  INTO v_nueva_version
  FROM negociaciones_versiones
  WHERE negociacion_id = p_negociacion_id;

  -- Desactivar versión anterior
  UPDATE negociaciones_versiones
  SET es_version_activa = false
  WHERE negociacion_id = p_negociacion_id
    AND es_version_activa = true;

  -- Crear nueva versión
  INSERT INTO negociaciones_versiones (
    negociacion_id,
    version,
    valor_vivienda,
    descuento_aplicado,
    valor_total,
    fuentes_pago,
    motivo_cambio,
    tipo_cambio,
    es_version_activa,
    creado_por
  ) VALUES (
    p_negociacion_id,
    v_nueva_version,
    p_valor_vivienda,
    p_descuento_aplicado,
    p_valor_total,
    p_fuentes_pago,
    p_motivo_cambio,
    p_tipo_cambio,
    true,
    auth.uid()
  )
  RETURNING id INTO v_version_id;

  -- Actualizar tabla principal negociaciones
  UPDATE negociaciones
  SET
    valor_vivienda = p_valor_vivienda,
    descuento_aplicado = p_descuento_aplicado,
    valor_total = p_valor_total,
    actualizado_en = NOW()
  WHERE id = p_negociacion_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION crear_nueva_version_negociacion IS 'Crea nueva versión de negociación (solo admin)';

-- =====================================================
-- 5. VISTA: Versión actual con metadata
-- =====================================================
CREATE OR REPLACE VIEW negociaciones_con_version_actual AS
SELECT
  n.*,
  nv.version as version_actual,
  nv.fuentes_pago as fuentes_pago_actual,
  nv.motivo_cambio as ultimo_motivo_cambio,
  nv.tipo_cambio as ultimo_tipo_cambio,
  nv.creado_en as fecha_ultima_version,
  u.nombres as modificado_por_nombre
FROM negociaciones n
INNER JOIN negociaciones_versiones nv
  ON n.id = nv.negociacion_id
  AND nv.es_version_activa = true
LEFT JOIN usuarios u ON nv.creado_por = u.id;

COMMENT ON VIEW negociaciones_con_version_actual IS 'Negociaciones con datos de versión activa';

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

-- Políticas para negociaciones_versiones
ALTER TABLE negociaciones_versiones ENABLE ROW LEVEL SECURITY;

-- Leer: Todos los usuarios autenticados pueden ver versiones
CREATE POLICY "Usuarios autenticados pueden leer versiones"
  ON negociaciones_versiones
  FOR SELECT
  TO authenticated
  USING (true);

-- Insertar: Solo admins (se valida en función)
CREATE POLICY "Solo admins pueden crear versiones"
  ON negociaciones_versiones
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol = 'Administrador'
    )
  );

-- Políticas para descuentos_negociacion
ALTER TABLE descuentos_negociacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden leer descuentos"
  ON descuentos_negociacion
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden registrar descuentos"
  ON descuentos_negociacion
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol = 'Administrador'
    )
  );

-- =====================================================
-- 7. GRANTS
-- =====================================================
GRANT SELECT ON negociaciones_versiones TO authenticated;
GRANT INSERT ON negociaciones_versiones TO authenticated;
GRANT SELECT ON descuentos_negociacion TO authenticated;
GRANT INSERT ON descuentos_negociacion TO authenticated;
GRANT SELECT ON negociaciones_con_version_actual TO authenticated;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
