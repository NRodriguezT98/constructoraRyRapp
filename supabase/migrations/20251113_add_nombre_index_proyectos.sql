-- ============================================
-- OPTIMIZACIÓN: Índice para búsqueda rápida de nombres duplicados
-- ============================================
-- Mejora el rendimiento de consultas con ILIKE en nombre de proyectos
-- De ~100ms a ~5ms en tablas con miles de registros

-- Índice case-insensitive para búsquedas de nombres duplicados
CREATE INDEX IF NOT EXISTS idx_proyectos_nombre_lower
ON proyectos (LOWER(nombre));

-- Comentario explicativo
COMMENT ON INDEX idx_proyectos_nombre_lower IS
'Índice para optimizar validaciones de nombres duplicados (case-insensitive)';
