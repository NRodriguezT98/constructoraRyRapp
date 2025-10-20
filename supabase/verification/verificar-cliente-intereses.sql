-- =====================================================
-- VERIFICAR ESTRUCTURA DE cliente_intereses
-- =====================================================

-- Ver todas las columnas
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'cliente_intereses'
ORDER BY ordinal_position;

-- =====================================================
-- COPIAR Y PEGAR EL RESULTADO AQUÍ
-- =====================================================
