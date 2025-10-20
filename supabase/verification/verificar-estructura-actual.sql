-- ============================================
-- QUERY: Verificar estructura actual de categorias_documento
-- Ejecuta esto PRIMERO para ver que columnas existen
-- ============================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'categorias_documento'
ORDER BY ordinal_position;

-- ============================================
-- QUERY: Ver datos actuales
-- ============================================

SELECT
  id,
  nombre,
  color,
  icono,
  orden
FROM public.categorias_documento
WHERE user_id = auth.uid()
ORDER BY orden
LIMIT 10;
