-- ================================================================
-- MIGRACIÓN: Historial de Estados de Viviendas
-- Fecha: 2025-11-22
-- Descripción: Tabla para auditar cambios de estado (Disponible → Inactiva → Disponible)
-- ================================================================

-- 1. Crear tabla de historial
CREATE TABLE IF NOT EXISTS viviendas_historial_estados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vivienda_id UUID NOT NULL REFERENCES viviendas(id) ON DELETE CASCADE,
  estado_anterior VARCHAR(50) NOT NULL,
  estado_nuevo VARCHAR(50) NOT NULL,
  fecha_cambio TIMESTAMPTZ DEFAULT NOW(),
  motivo TEXT NOT NULL CHECK (char_length(motivo) >= 20),
  usuario_id UUID REFERENCES usuarios(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT estados_diferentes CHECK (estado_anterior != estado_nuevo)
);

-- 2. Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_viviendas_historial_vivienda
  ON viviendas_historial_estados(vivienda_id);

CREATE INDEX IF NOT EXISTS idx_viviendas_historial_fecha
  ON viviendas_historial_estados(fecha_cambio DESC);

CREATE INDEX IF NOT EXISTS idx_viviendas_historial_usuario
  ON viviendas_historial_estados(usuario_id);

CREATE INDEX IF NOT EXISTS idx_viviendas_historial_estados
  ON viviendas_historial_estados(estado_anterior, estado_nuevo);

-- 3. RLS Policies
ALTER TABLE viviendas_historial_estados ENABLE ROW LEVEL SECURITY;

-- Policy: Todos los usuarios autenticados pueden ver historial
CREATE POLICY "Usuarios autenticados pueden ver historial estados"
  ON viviendas_historial_estados
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Solo admins pueden insertar historial
CREATE POLICY "Solo admins pueden insertar historial estados"
  ON viviendas_historial_estados
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );

-- 4. Comentarios
COMMENT ON TABLE viviendas_historial_estados IS 'Historial completo de cambios de estado de viviendas para auditoría y trazabilidad';
COMMENT ON COLUMN viviendas_historial_estados.estado_anterior IS 'Estado previo de la vivienda antes del cambio';
COMMENT ON COLUMN viviendas_historial_estados.estado_nuevo IS 'Nuevo estado asignado a la vivienda';
COMMENT ON COLUMN viviendas_historial_estados.motivo IS 'Justificación del cambio de estado (mínimo 20 caracteres)';
COMMENT ON COLUMN viviendas_historial_estados.metadata IS 'Datos adicionales del contexto (negociaciones activas, abonos, etc.)';

-- 5. Verificar ejecución
SELECT
  COUNT(*) as registros_actuales,
  MIN(fecha_cambio) as primer_registro,
  MAX(fecha_cambio) as ultimo_registro
FROM viviendas_historial_estados;
