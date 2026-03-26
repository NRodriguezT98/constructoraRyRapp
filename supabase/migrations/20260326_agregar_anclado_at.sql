-- ============================================
-- MIGRACIÓN: Agregar campo anclado_at a tablas de documentos
-- Permite ordenar documentos anclados por fecha de anclaje
-- ============================================

-- 1. documentos_proyecto
ALTER TABLE documentos_proyecto
  ADD COLUMN IF NOT EXISTS anclado_at timestamptz DEFAULT NULL;

-- 2. documentos_vivienda
ALTER TABLE documentos_vivienda
  ADD COLUMN IF NOT EXISTS anclado_at timestamptz DEFAULT NULL;

-- 3. documentos_cliente
ALTER TABLE documentos_cliente
  ADD COLUMN IF NOT EXISTS anclado_at timestamptz DEFAULT NULL;

-- 4. Poblar anclado_at para documentos ya anclados (usar fecha_actualizacion como aproximación)
UPDATE documentos_proyecto SET anclado_at = fecha_actualizacion WHERE es_importante = true AND anclado_at IS NULL;
UPDATE documentos_vivienda SET anclado_at = fecha_actualizacion WHERE es_importante = true AND anclado_at IS NULL;
UPDATE documentos_cliente SET anclado_at = fecha_actualizacion WHERE es_importante = true AND anclado_at IS NULL;

-- 5. Índice parcial para consultas rápidas de anclados
CREATE INDEX IF NOT EXISTS idx_documentos_proyecto_anclado_at ON documentos_proyecto (anclado_at) WHERE anclado_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_vivienda_anclado_at ON documentos_vivienda (anclado_at) WHERE anclado_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_cliente_anclado_at ON documentos_cliente (anclado_at) WHERE anclado_at IS NOT NULL;
