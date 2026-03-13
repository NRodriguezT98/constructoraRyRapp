-- =====================================================
-- Verificación: Índice de Validación de Duplicados
-- =====================================================

-- 1. Verificar que el índice existe
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'clientes'
  AND indexname = 'idx_clientes_tipo_numero_documento';

-- 2. Analizar plan de ejecución (debe usar Index Scan)
EXPLAIN ANALYZE
SELECT id, nombres, apellidos, tipo_documento, numero_documento, estado
FROM clientes
WHERE tipo_documento = 'CC'
  AND numero_documento = '12345678';

-- 3. Ver todos los índices de la tabla clientes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'clientes'
ORDER BY indexname;
