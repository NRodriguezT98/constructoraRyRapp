-- ============================================
-- Migración: Eliminar categoria_id
-- ============================================
-- Fecha: 2025-12-10
-- Descripción: Eliminar categoria_id de documentos_pendientes
--              porque la tabla categorias_documentos ya no existe
--              y la columna no es necesaria (ya tiene tipo_documento)
-- ============================================

-- Eliminar columna categoria_id
ALTER TABLE documentos_pendientes
DROP COLUMN IF EXISTS categoria_id;

-- Verificar que se eliminó
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'documentos_pendientes'
  AND column_name = 'categoria_id';
