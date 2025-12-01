-- ================================================================
-- MIGRACIÓN: Sistema de Inactivación de Viviendas (Soft Delete)
-- Fecha: 2025-11-22
-- Descripción: Agregar columnas para inactivación/reactivación
-- ================================================================

-- 1. Agregar columnas de inactivación
ALTER TABLE viviendas
ADD COLUMN IF NOT EXISTS fecha_inactivacion TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS motivo_inactivacion TEXT,
ADD COLUMN IF NOT EXISTS inactivada_por UUID REFERENCES usuarios(id),
ADD COLUMN IF NOT EXISTS fecha_reactivacion TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS motivo_reactivacion TEXT,
ADD COLUMN IF NOT EXISTS reactivada_por UUID REFERENCES usuarios(id),
ADD COLUMN IF NOT EXISTS contador_desactivaciones INTEGER DEFAULT 0;

-- 2. Verificar/Actualizar constraint de estado
ALTER TABLE viviendas
DROP CONSTRAINT IF EXISTS viviendas_estado_check;

ALTER TABLE viviendas
ADD CONSTRAINT viviendas_estado_check CHECK (
  estado IN (
    'Disponible',
    'Asignada',
    'Vendida',
    'Reservada',
    'Suspendida',
    'Cancelada',
    'Inactiva'
  )
);

-- 3. Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_viviendas_estado ON viviendas(estado);
CREATE INDEX IF NOT EXISTS idx_viviendas_inactivas ON viviendas(estado) WHERE estado = 'Inactiva';
CREATE INDEX IF NOT EXISTS idx_viviendas_fecha_inactivacion ON viviendas(fecha_inactivacion) WHERE fecha_inactivacion IS NOT NULL;

-- 4. Comentarios
COMMENT ON COLUMN viviendas.fecha_inactivacion IS 'Fecha en que la vivienda fue marcada como inactiva (soft delete)';
COMMENT ON COLUMN viviendas.motivo_inactivacion IS 'Razón detallada por la que se inactivó la vivienda (mínimo 50 caracteres)';
COMMENT ON COLUMN viviendas.inactivada_por IS 'Usuario Administrador que realizó la inactivación';
COMMENT ON COLUMN viviendas.fecha_reactivacion IS 'Última fecha en que la vivienda fue reactivada';
COMMENT ON COLUMN viviendas.motivo_reactivacion IS 'Razón detallada por la que se reactivó la vivienda (mínimo 30 caracteres)';
COMMENT ON COLUMN viviendas.reactivada_por IS 'Usuario Administrador que realizó la reactivación';
COMMENT ON COLUMN viviendas.contador_desactivaciones IS 'Contador de cuántas veces ha sido desactivada/reactivada (auditoría)';

-- 5. Verificar ejecución
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'viviendas'
  AND column_name IN (
    'fecha_inactivacion',
    'motivo_inactivacion',
    'inactivada_por',
    'fecha_reactivacion',
    'motivo_reactivacion',
    'reactivada_por',
    'contador_desactivaciones'
  )
ORDER BY ordinal_position;
