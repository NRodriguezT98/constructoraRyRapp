-- =====================================================
-- VERIFICAR ESTRUCTURA DE clientes
-- =====================================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;

-- =====================================================
-- COPIAR Y PEGAR EL RESULTADO AQUÍ
-- =====================================================
