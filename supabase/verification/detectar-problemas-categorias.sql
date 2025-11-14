-- Detectar categorías con problemas específicos

-- 1. Categorías con modulos_permitidos NULL o vacío
SELECT
  'PROBLEMA: Sin módulos' as tipo_problema,
  COUNT(*) as cantidad
FROM categorias_documento
WHERE modulos_permitidos IS NULL
   OR modulos_permitidos = '{}';

-- 2. Categorías con user_id NULL (huérfanas)
SELECT
  'PROBLEMA: Sin user_id' as tipo_problema,
  COUNT(*) as cantidad
FROM categorias_documento
WHERE user_id IS NULL;

-- 3. Categorías duplicadas (mismo nombre y módulo)
SELECT
  'PROBLEMA: Duplicadas' as tipo_problema,
  COUNT(*) as cantidad
FROM (
  SELECT nombre, modulos_permitidos
  FROM categorias_documento
  GROUP BY nombre, modulos_permitidos
  HAVING COUNT(*) > 1
) duplicadas;

-- 4. Categorías con es_global=false (deberían ser true)
SELECT
  'ATENCIÓN: No globales' as tipo_problema,
  COUNT(*) as cantidad,
  STRING_AGG(nombre, ', ') as categorias
FROM categorias_documento
WHERE es_global = false;

-- 5. Listar todas las categorías problemáticas con es_global=false
SELECT
  id,
  nombre,
  es_global,
  modulos_permitidos,
  fecha_creacion
FROM categorias_documento
WHERE es_global = false
ORDER BY fecha_creacion DESC;
