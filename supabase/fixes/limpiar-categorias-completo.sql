-- ============================================
-- LIMPIEZA COMPLETA: Categorías huérfanas o problemáticas
-- ============================================

-- 1. Ver categorías que se van a limpiar
SELECT
  id,
  nombre,
  es_global,
  modulos_permitidos,
  user_id,
  fecha_creacion,
  CASE
    WHEN es_global = false THEN 'No global (debería ser true)'
    WHEN modulos_permitidos IS NULL THEN 'Sin módulos (NULL)'
    WHEN modulos_permitidos = '{}' THEN 'Sin módulos (vacío)'
    WHEN user_id IS NULL THEN 'Sin usuario (huérfana)'
    ELSE 'OK'
  END as problema
FROM categorias_documento
WHERE es_global = false
   OR modulos_permitidos IS NULL
   OR modulos_permitidos = '{}'
   OR user_id IS NULL
ORDER BY fecha_creacion DESC;

-- 2. Actualizar categorías con es_global=false a true
UPDATE categorias_documento
SET es_global = true
WHERE es_global = false;

-- 3. Actualizar categorías sin módulos a 'proyectos' por defecto
UPDATE categorias_documento
SET modulos_permitidos = ARRAY['proyectos']::text[]
WHERE modulos_permitidos IS NULL
   OR modulos_permitidos = '{}';

-- 4. Verificar resultado final
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE es_global = true) as globales,
  COUNT(*) FILTER (WHERE es_global = false) as no_globales,
  COUNT(*) FILTER (WHERE modulos_permitidos IS NULL OR modulos_permitidos = '{}') as sin_modulos,
  COUNT(*) FILTER (WHERE user_id IS NULL) as sin_usuario
FROM categorias_documento;

-- 5. Ver todas las categorías ordenadas por módulo
SELECT
  nombre,
  es_global,
  modulos_permitidos,
  color,
  icono
FROM categorias_documento
ORDER BY modulos_permitidos, nombre;
