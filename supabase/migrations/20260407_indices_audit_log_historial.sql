-- ============================================================
-- Índices para audit_log: mejora consultas de historial
-- ============================================================
-- El historial de cliente hace 6 queries paralelas a audit_log
-- usando .contains('metadata', { cliente_id }) que usa el
-- operador JSONB @>. Sin índice GIN, cada query es full-scan.
-- ============================================================

-- 1. GIN sobre metadata para filtros @> (cliente_id, etc.)
CREATE INDEX IF NOT EXISTS idx_audit_log_metadata_gin
  ON audit_log USING GIN (metadata);

-- 2. Compuesto (tabla, fecha_evento) para ORDER BY en cada query por tabla
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla_fecha
  ON audit_log (tabla, fecha_evento DESC);

-- 3. (tabla, registro_id) para la query directa de clientes
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla_registro
  ON audit_log (tabla, registro_id);
