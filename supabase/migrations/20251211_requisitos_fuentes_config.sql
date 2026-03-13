/**
 * ============================================
 * MIGRACIÓN: Sistema de Configuración de Requisitos de Fuentes
 * ============================================
 *
 * Crea tabla para configurar requisitos de validación de fuentes de pago
 * desde una interfaz administrativa, sin necesidad de modificar código.
 *
 * Características:
 * - Configuración dinámica por tipo de fuente
 * - Niveles de validación personalizables
 * - Orden y categorización de pasos
 * - Activación/desactivación de requisitos
 * - Versionado de configuraciones
 *
 * @version 1.0.0 - 2025-12-11
 */

-- ============================================
-- TABLA: requisitos_fuentes_pago_config
-- ============================================

CREATE TABLE IF NOT EXISTS requisitos_fuentes_pago_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tipo de fuente
  tipo_fuente TEXT NOT NULL,

  -- Información del paso
  paso_identificador TEXT NOT NULL, -- Ej: 'boleta_registro', 'solicitud_desembolso'
  titulo TEXT NOT NULL,
  descripcion TEXT,
  instrucciones TEXT,

  -- Validación
  nivel_validacion TEXT NOT NULL CHECK (nivel_validacion IN (
    'DOCUMENTO_OBLIGATORIO',
    'DOCUMENTO_OPCIONAL',
    'SOLO_CONFIRMACION'
  )),

  -- Categorización de documentos
  tipo_documento_sugerido TEXT,
  categoria_documento TEXT,

  -- Orden y estado
  orden INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,

  -- Versionado
  version INTEGER NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_creacion UUID REFERENCES auth.users(id),
  usuario_actualizacion UUID REFERENCES auth.users(id),

  -- Evitar pasos duplicados por tipo de fuente (en misma versión activa)
  CONSTRAINT uq_tipo_paso_version UNIQUE (tipo_fuente, paso_identificador, version)
);

-- Índices para optimizar consultas
CREATE INDEX idx_requisitos_tipo_fuente ON requisitos_fuentes_pago_config(tipo_fuente);
CREATE INDEX idx_requisitos_activo ON requisitos_fuentes_pago_config(activo) WHERE activo = true;
CREATE INDEX idx_requisitos_version ON requisitos_fuentes_pago_config(version);
CREATE INDEX idx_requisitos_orden ON requisitos_fuentes_pago_config(orden);

-- ============================================
-- TRIGGER: Actualizar fecha_actualizacion
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion_requisitos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_fecha_requisitos
  BEFORE UPDATE ON requisitos_fuentes_pago_config
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion_requisitos();

-- ============================================
-- DATOS INICIALES: Configuración simplificada
-- ============================================

-- Cuota Inicial: Sin requisitos
-- (No insertamos nada, la ausencia de registros indica "sin requisitos")

-- Crédito Hipotecario: 2 pasos
INSERT INTO requisitos_fuentes_pago_config (
  tipo_fuente,
  paso_identificador,
  titulo,
  descripcion,
  instrucciones,
  nivel_validacion,
  tipo_documento_sugerido,
  categoria_documento,
  orden
) VALUES
(
  'Crédito Hipotecario',
  'boleta_registro',
  'Boleta de Registro',
  'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente',
  'Sube la boleta oficial expedida por la Oficina de Registro de Instrumentos Públicos que confirma que el inmueble pasó a ser propiedad del cliente.',
  'DOCUMENTO_OBLIGATORIO',
  'Boleta de Registro',
  'escrituras',
  1
),
(
  'Crédito Hipotecario',
  'solicitud_desembolso',
  'Solicitud de Desembolso del Crédito',
  'Evidencia de solicitud de cobro enviada al banco (captura de correo/formulario)',
  'Opcional: Sube una captura de pantalla del correo o formulario enviado al banco solicitando el desembolso.',
  'DOCUMENTO_OPCIONAL',
  'Solicitud Desembolso',
  'credito-hipotecario',
  2
);

-- Subsidio Mi Casa Ya: 2 pasos
INSERT INTO requisitos_fuentes_pago_config (
  tipo_fuente,
  paso_identificador,
  titulo,
  descripcion,
  instrucciones,
  nivel_validacion,
  tipo_documento_sugerido,
  categoria_documento,
  orden
) VALUES
(
  'Subsidio Mi Casa Ya',
  'boleta_registro',
  'Boleta de Registro',
  'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente',
  'Sube la boleta oficial expedida por la Oficina de Registro de Instrumentos Públicos que confirma que el inmueble pasó a ser propiedad del cliente.',
  'DOCUMENTO_OBLIGATORIO',
  'Boleta de Registro',
  'escrituras',
  1
),
(
  'Subsidio Mi Casa Ya',
  'solicitud_desembolso',
  'Solicitud de Desembolso del Subsidio',
  'Confirmación de envío de solicitud de cobro al MinVivienda',
  'Opcional: Sube evidencia de la solicitud enviada al Ministerio de Vivienda.',
  'DOCUMENTO_OPCIONAL',
  'Solicitud Desembolso',
  'subsidios',
  2
);

-- Subsidio Caja de Compensación: 2 pasos
INSERT INTO requisitos_fuentes_pago_config (
  tipo_fuente,
  paso_identificador,
  titulo,
  descripcion,
  instrucciones,
  nivel_validacion,
  tipo_documento_sugerido,
  categoria_documento,
  orden
) VALUES
(
  'Subsidio Caja de Compensación',
  'boleta_registro',
  'Boleta de Registro',
  'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente',
  'Sube la boleta oficial expedida por la Oficina de Registro de Instrumentos Públicos que confirma que el inmueble pasó a ser propiedad del cliente.',
  'DOCUMENTO_OBLIGATORIO',
  'Boleta de Registro',
  'escrituras',
  1
),
(
  'Subsidio Caja de Compensación',
  'solicitud_desembolso',
  'Solicitud de Desembolso del Subsidio',
  'Confirmación de envío de solicitud de cobro a la Caja de Compensación',
  'Opcional: Sube evidencia de la solicitud enviada a la Caja de Compensación.',
  'DOCUMENTO_OPCIONAL',
  'Solicitud Desembolso',
  'subsidios',
  2
);

-- Subsidio Caja Compensación (alias): Mismo que arriba
INSERT INTO requisitos_fuentes_pago_config (
  tipo_fuente,
  paso_identificador,
  titulo,
  descripcion,
  instrucciones,
  nivel_validacion,
  tipo_documento_sugerido,
  categoria_documento,
  orden
) VALUES
(
  'Subsidio Caja Compensación',
  'boleta_registro',
  'Boleta de Registro',
  'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente',
  'Sube la boleta oficial expedida por la Oficina de Registro de Instrumentos Públicos que confirma que el inmueble pasó a ser propiedad del cliente.',
  'DOCUMENTO_OBLIGATORIO',
  'Boleta de Registro',
  'escrituras',
  1
),
(
  'Subsidio Caja Compensación',
  'solicitud_desembolso',
  'Solicitud de Desembolso del Subsidio',
  'Confirmación de envío de solicitud de cobro a la Caja de Compensación',
  'Opcional: Sube evidencia de la solicitud enviada a la Caja de Compensación.',
  'DOCUMENTO_OPCIONAL',
  'Solicitud Desembolso',
  'subsidios',
  2
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE requisitos_fuentes_pago_config ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer requisitos activos
CREATE POLICY "Usuarios autenticados pueden leer requisitos activos"
  ON requisitos_fuentes_pago_config
  FOR SELECT
  TO authenticated
  USING (activo = true);

-- Solo Administradores pueden modificar
CREATE POLICY "Solo Administradores pueden modificar requisitos"
  ON requisitos_fuentes_pago_config
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM usuarios WHERE rol = 'Administrador'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM usuarios WHERE rol = 'Administrador'
  ));

-- ============================================
-- FUNCIÓN: Obtener requisitos de una fuente
-- ============================================

CREATE OR REPLACE FUNCTION obtener_requisitos_fuente(p_tipo_fuente TEXT)
RETURNS TABLE (
  id UUID,
  paso_identificador TEXT,
  titulo TEXT,
  descripcion TEXT,
  instrucciones TEXT,
  nivel_validacion TEXT,
  tipo_documento_sugerido TEXT,
  categoria_documento TEXT,
  orden INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.paso_identificador,
    r.titulo,
    r.descripcion,
    r.instrucciones,
    r.nivel_validacion,
    r.tipo_documento_sugerido,
    r.categoria_documento,
    r.orden
  FROM requisitos_fuentes_pago_config r
  WHERE r.tipo_fuente = p_tipo_fuente
    AND r.activo = true
    AND r.version = (
      SELECT MAX(version)
      FROM requisitos_fuentes_pago_config
      WHERE tipo_fuente = p_tipo_fuente
    )
  ORDER BY r.orden ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE requisitos_fuentes_pago_config IS 'Configuración de requisitos de validación para fuentes de pago (administrable desde UI)';
COMMENT ON COLUMN requisitos_fuentes_pago_config.tipo_fuente IS 'Tipo de fuente: Cuota Inicial, Crédito Hipotecario, Subsidio Mi Casa Ya, etc.';
COMMENT ON COLUMN requisitos_fuentes_pago_config.paso_identificador IS 'Identificador único del paso (snake_case)';
COMMENT ON COLUMN requisitos_fuentes_pago_config.nivel_validacion IS 'DOCUMENTO_OBLIGATORIO, DOCUMENTO_OPCIONAL, SOLO_CONFIRMACION';
COMMENT ON COLUMN requisitos_fuentes_pago_config.version IS 'Versión de la configuración (permite versionado sin perder histórico)';
COMMENT ON COLUMN requisitos_fuentes_pago_config.activo IS 'Solo requisitos activos se usan en validaciones';
