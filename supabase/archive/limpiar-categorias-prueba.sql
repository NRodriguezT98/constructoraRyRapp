-- ============================================
-- LIMPIEZA: Eliminar categorías de prueba
-- Fecha: 2025-10-17
-- ============================================

-- Ver categorías de prueba antes de eliminar
SELECT
  id,
  nombre,
  es_global,
  modulos_permitidos,
  fecha_creacion
FROM public.categorias_documento
WHERE nombre ILIKE '%test%'
ORDER BY fecha_creacion DESC;

-- Eliminar categorías de prueba
-- DESCOMENTAR la siguiente línea después de verificar que son las correctas:
-- DELETE FROM public.categorias_documento
-- WHERE nombre ILIKE '%test%';

-- Verificar después de eliminar (descomentar después del DELETE)
-- SELECT COUNT(*) as total_eliminadas
-- FROM public.categorias_documento
-- WHERE nombre ILIKE '%test%';
