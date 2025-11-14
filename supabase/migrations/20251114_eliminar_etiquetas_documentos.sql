-- =====================================================
-- Migración: Eliminar funcionalidad de etiquetas
-- Fecha: 2025-11-14
-- Descripción: Elimina la columna etiquetas de la tabla documentos_proyecto
-- =====================================================

-- Eliminar columna etiquetas
ALTER TABLE documentos_proyecto
DROP COLUMN IF EXISTS etiquetas;

-- Comentario en tabla
COMMENT ON TABLE documentos_proyecto IS 'Documentos asociados a proyectos (sin etiquetas desde 2025-11-14)';
