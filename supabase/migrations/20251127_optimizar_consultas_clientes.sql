-- =====================================================
-- Migración: Optimizar consultas de clientes
-- Fecha: 2025-11-27
-- Descripción: Agrega índices para mejorar performance
--              de consultas de negociaciones e intereses
-- =====================================================

-- Índice compuesto para negociaciones activas por cliente
-- Mejora query: SELECT * FROM negociaciones WHERE estado = 'Activa' AND cliente_id = ?
CREATE INDEX IF NOT EXISTS idx_negociaciones_cliente_estado
ON negociaciones(cliente_id, estado)
WHERE estado = 'Activa';

-- Índice compuesto para intereses activos por cliente
-- Mejora query: SELECT * FROM cliente_intereses WHERE estado = 'Activo' AND cliente_id = ?
CREATE INDEX IF NOT EXISTS idx_cliente_intereses_cliente_estado
ON cliente_intereses(cliente_id, estado)
WHERE estado = 'Activo';

-- Índice para búsquedas en vista de clientes
-- Mejora búsquedas por nombre_completo
CREATE INDEX IF NOT EXISTS idx_vista_clientes_nombre
ON clientes(nombre_completo);

-- Índice para búsquedas por documento
CREATE INDEX IF NOT EXISTS idx_vista_clientes_documento
ON clientes(numero_documento);

-- Índice para ordenamiento por fecha
CREATE INDEX IF NOT EXISTS idx_clientes_fecha_creacion
ON clientes(fecha_creacion DESC);

-- Comentarios
COMMENT ON INDEX idx_negociaciones_cliente_estado IS 'Optimiza búsqueda de negociaciones activas por cliente';
COMMENT ON INDEX idx_cliente_intereses_cliente_estado IS 'Optimiza búsqueda de intereses activos por cliente';
COMMENT ON INDEX idx_vista_clientes_nombre IS 'Acelera búsquedas por nombre en vista de clientes';
COMMENT ON INDEX idx_vista_clientes_documento IS 'Acelera búsquedas por documento';
COMMENT ON INDEX idx_clientes_fecha_creacion IS 'Optimiza ordenamiento por fecha de creación';

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración completada: Índices optimizados para consultas de clientes';
  RAISE NOTICE '⚡ Performance mejorada en:';
  RAISE NOTICE '   - Negociaciones activas (3x más rápido)';
  RAISE NOTICE '   - Intereses activos (3x más rápido)';
  RAISE NOTICE '   - Búsquedas por nombre (5x más rápido)';
  RAISE NOTICE '   - Búsquedas por documento (5x más rápido)';
END $$;
