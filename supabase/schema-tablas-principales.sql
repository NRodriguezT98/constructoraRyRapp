-- ============================================
-- TODAS LAS TABLAS CON SUS COLUMNAS
-- ============================================

-- documentos_cliente
SELECT 'documentos_cliente' AS tabla, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'documentos_cliente'
ORDER BY ordinal_position;

-- fuentes_pago
SELECT 'fuentes_pago' AS tabla, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'fuentes_pago'
ORDER BY ordinal_position;

-- documentos_pendientes
SELECT 'documentos_pendientes' AS tabla, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'documentos_pendientes'
ORDER BY ordinal_position;

-- negociaciones
SELECT 'negociaciones' AS tabla, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'negociaciones'
ORDER BY ordinal_position;

-- clientes
SELECT 'clientes' AS tabla, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'clientes'
ORDER BY ordinal_position;
