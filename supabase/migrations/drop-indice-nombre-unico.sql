-- Eliminar el índice único que impide nombres duplicados
DROP INDEX IF EXISTS idx_categorias_globales_nombre CASCADE;

-- Verificar que se eliminó
SELECT indexname
FROM pg_indexes
WHERE tablename = 'categorias_documento'
  AND indexname = 'idx_categorias_globales_nombre';
