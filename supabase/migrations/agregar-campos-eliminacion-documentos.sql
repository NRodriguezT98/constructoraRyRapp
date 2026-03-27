-- ============================================================
-- MIGRACIÓN: Agregar campos de auditoría para eliminación
-- Afecta: documentos_proyecto, documentos_vivienda, documentos_cliente
-- ============================================================

-- documentos_proyecto
ALTER TABLE documentos_proyecto
  ADD COLUMN IF NOT EXISTS eliminado_en  timestamptz NULL,
  ADD COLUMN IF NOT EXISTS eliminado_por uuid NULL REFERENCES usuarios(id) ON DELETE SET NULL;

-- documentos_vivienda
ALTER TABLE documentos_vivienda
  ADD COLUMN IF NOT EXISTS eliminado_en  timestamptz NULL,
  ADD COLUMN IF NOT EXISTS eliminado_por uuid NULL REFERENCES usuarios(id) ON DELETE SET NULL;

-- documentos_cliente
ALTER TABLE documentos_cliente
  ADD COLUMN IF NOT EXISTS eliminado_en  timestamptz NULL,
  ADD COLUMN IF NOT EXISTS eliminado_por uuid NULL REFERENCES usuarios(id) ON DELETE SET NULL;

-- Índices para consultas de papelera ordenadas por fecha de eliminación
CREATE INDEX IF NOT EXISTS idx_documentos_proyecto_eliminacion
  ON documentos_proyecto (eliminado_en DESC)
  WHERE estado = 'eliminado';

CREATE INDEX IF NOT EXISTS idx_documentos_vivienda_eliminacion
  ON documentos_vivienda (eliminado_en DESC)
  WHERE estado = 'eliminado';

CREATE INDEX IF NOT EXISTS idx_documentos_cliente_eliminacion
  ON documentos_cliente (eliminado_en DESC)
  WHERE estado = 'eliminado';
