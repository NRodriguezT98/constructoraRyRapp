-- =====================================================
-- MIGRACIÓN: Sistema de Correcciones de Pasos
-- Fecha: 2025-11-03
-- Descripción: Tabla para auditar correcciones de fechas
--              y documentos en pasos de negociaciones
-- =====================================================

-- =====================================================
-- 1. CREAR TABLA auditoria_correcciones
-- =====================================================

CREATE TABLE IF NOT EXISTS auditoria_correcciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tipo de corrección
  tipo_correccion TEXT NOT NULL CHECK (
    tipo_correccion IN ('fecha_completado', 'documento_reemplazado')
  ),

  -- Referencias
  paso_negociacion_id UUID NOT NULL REFERENCES procesos_negociacion(id) ON DELETE CASCADE,
  documento_id UUID REFERENCES documentos_cliente(id) ON DELETE SET NULL,

  -- Valores antes/después
  valor_anterior TEXT NOT NULL,
  valor_nuevo TEXT NOT NULL,

  -- Justificación obligatoria
  motivo TEXT NOT NULL CHECK (char_length(motivo) >= 10),

  -- Auditoría
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  fecha_correccion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata adicional (JSON flexible)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. ÍNDICES para mejorar performance
-- =====================================================

CREATE INDEX idx_auditoria_correcciones_paso
  ON auditoria_correcciones(paso_negociacion_id);

CREATE INDEX idx_auditoria_correcciones_usuario
  ON auditoria_correcciones(usuario_id);

CREATE INDEX idx_auditoria_correcciones_tipo
  ON auditoria_correcciones(tipo_correccion);

CREATE INDEX idx_auditoria_correcciones_fecha
  ON auditoria_correcciones(fecha_correccion DESC);

-- =====================================================
-- 3. COMENTARIOS para documentación
-- =====================================================

COMMENT ON TABLE auditoria_correcciones IS
  'Registro de correcciones realizadas en pasos de negociaciones (fechas y documentos)';

COMMENT ON COLUMN auditoria_correcciones.tipo_correccion IS
  'Tipo de corrección: fecha_completado o documento_reemplazado';

COMMENT ON COLUMN auditoria_correcciones.motivo IS
  'Justificación obligatoria de por qué se realizó la corrección (mínimo 10 caracteres)';

COMMENT ON COLUMN auditoria_correcciones.metadata IS
  'Información adicional en formato JSON (ej: nombre de archivos, validaciones aplicadas)';

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE auditoria_correcciones ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden ver correcciones de sus propios procesos
CREATE POLICY "usuarios_ver_correcciones_propios_procesos"
  ON auditoria_correcciones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM procesos_negociacion pn
      JOIN negociaciones n ON n.id = pn.negociacion_id
      WHERE pn.id = auditoria_correcciones.paso_negociacion_id
      AND n.usuario_creacion = auth.uid()
    )
  );

-- Policy: Admins y gerentes pueden ver todas las correcciones
-- NOTA: Por ahora permitir a todos los usuarios autenticados.
-- TODO: Implementar verificación de roles cuando exista tabla de usuarios/roles
CREATE POLICY "admins_ver_todas_correcciones"
  ON auditoria_correcciones
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Solo usuarios autenticados pueden insertar correcciones
CREATE POLICY "usuarios_autenticados_insertar_correcciones"
  ON auditoria_correcciones
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND usuario_id = auth.uid()
  );

-- Policy: Nadie puede actualizar o eliminar correcciones (inmutabilidad)
-- Las correcciones son permanentes para mantener auditoría

-- =====================================================
-- 5. FUNCIÓN HELPER para registrar correcciones
-- =====================================================

CREATE OR REPLACE FUNCTION registrar_correccion_paso(
  p_tipo_correccion TEXT,
  p_paso_id UUID,
  p_documento_id UUID,
  p_valor_anterior TEXT,
  p_valor_nuevo TEXT,
  p_motivo TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_correccion_id UUID;
BEGIN
  -- Validar tipo de corrección
  IF p_tipo_correccion NOT IN ('fecha_completado', 'documento_reemplazado') THEN
    RAISE EXCEPTION 'Tipo de corrección inválido: %', p_tipo_correccion;
  END IF;

  -- Validar motivo
  IF char_length(p_motivo) < 10 THEN
    RAISE EXCEPTION 'El motivo debe tener al menos 10 caracteres';
  END IF;

  -- Insertar corrección
  INSERT INTO auditoria_correcciones (
    tipo_correccion,
    paso_negociacion_id,
    documento_id,
    valor_anterior,
    valor_nuevo,
    motivo,
    usuario_id,
    metadata
  )
  VALUES (
    p_tipo_correccion,
    p_paso_id,
    p_documento_id,
    p_valor_anterior,
    p_valor_nuevo,
    p_motivo,
    auth.uid(),
    p_metadata
  )
  RETURNING id INTO v_correccion_id;

  RETURN v_correccion_id;
END;
$$;

COMMENT ON FUNCTION registrar_correccion_paso IS
  'Helper para registrar correcciones con validaciones automáticas';

-- =====================================================
-- 6. VISTA para consultas simplificadas
-- =====================================================

CREATE OR REPLACE VIEW vista_auditoria_correcciones AS
SELECT
  ac.id,
  ac.tipo_correccion,
  ac.valor_anterior,
  ac.valor_nuevo,
  ac.motivo,
  ac.fecha_correccion,

  -- Información del paso
  pn.nombre AS paso_nombre,
  pn.orden AS paso_orden,

  -- Información de la negociación
  n.id AS negociacion_id,
  n.cliente_id,

  -- Información del usuario que hizo la corrección
  ac.usuario_id,
  u.email AS usuario_email,

  -- Documento (si aplica)
  ac.documento_id,
  dc.nombre_archivo AS documento_nombre,

  -- Metadata
  ac.metadata

FROM auditoria_correcciones ac
JOIN procesos_negociacion pn ON pn.id = ac.paso_negociacion_id
JOIN negociaciones n ON n.id = pn.negociacion_id
JOIN auth.users u ON u.id = ac.usuario_id
LEFT JOIN documentos_cliente dc ON dc.id = ac.documento_id;

COMMENT ON VIEW vista_auditoria_correcciones IS
  'Vista completa de correcciones con información relacionada para consultas';

-- =====================================================
-- 7. GRANTS
-- =====================================================

GRANT SELECT ON vista_auditoria_correcciones TO authenticated;
GRANT EXECUTE ON FUNCTION registrar_correccion_paso TO authenticated;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
