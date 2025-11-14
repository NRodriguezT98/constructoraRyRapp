-- ============================================
-- VERIFICACIÓN: Estado completo de categorías
-- ============================================

-- 1. Resumen general
SELECT
  COUNT(*) as total_categorias,
  COUNT(*) FILTER (WHERE es_global = true) as globales,
  COUNT(*) FILTER (WHERE es_global = false) as no_globales,
  COUNT(*) FILTER (WHERE modulos_permitidos IS NULL) as sin_modulos_null,
  COUNT(*) FILTER (WHERE modulos_permitidos = '{}') as sin_modulos_vacio,
  COUNT(*) FILTER (WHERE array_length(modulos_permitidos, 1) > 0) as con_modulos
FROM categorias_documento;

-- 2. Categorías problemáticas (sin módulos)
SELECT
  id,
  nombre,
  es_global,
  modulos_permitidos,
  user_id,
  fecha_creacion
FROM categorias_documento
WHERE modulos_permitidos IS NULL
   OR modulos_permitidos = '{}'
ORDER BY fecha_creacion DESC;

-- 3. Distribución por módulo
SELECT
  unnest(modulos_permitidos) as modulo,
  COUNT(*) as cantidad,
  STRING_AGG(nombre, ', ' ORDER BY nombre) as categorias
FROM categorias_documento
WHERE modulos_permitidos IS NOT NULL
  AND modulos_permitidos != '{}'
GROUP BY modulo
ORDER BY modulo;

-- 4. Categorías sin user_id (huérfanas)
SELECT
  id,
  nombre,
  es_global,
  modulos_permitidos,
  user_id,
  fecha_creacion
FROM categorias_documento
WHERE user_id IS NULL
ORDER BY fecha_creacion DESC;

-- 5. Todas las categorías ordenadas por módulo y nombre
SELECT
  id,
  nombre,
  es_global,
  modulos_permitidos,
  color,
  icono,
  orden,
  user_id,
  fecha_creacion
FROM categorias_documento
ORDER BY
  es_global DESC,
  modulos_permitidos,
  nombre;

-- 6. Categorías duplicadas (mismo nombre)
SELECT
  nombre,
  COUNT(*) as cantidad,
  STRING_AGG(DISTINCT user_id::text, ', ') as usuarios,
  STRING_AGG(DISTINCT modulos_permitidos::text, ' | ') as modulos
FROM categorias_documento
GROUP BY nombre
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;
