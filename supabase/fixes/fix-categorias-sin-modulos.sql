-- ============================================
-- FIX: Categorías con modulos_permitidos vacío
-- ============================================
-- Problema: Categorías creadas con es_global=true tenían modulos_permitidos=[]
-- Solución: Actualizar esas categorías para incluir al menos 'proyectos'

-- 1. Ver categorías problemáticas
SELECT
  id,
  nombre,
  es_global,
  modulos_permitidos,
  fecha_creacion
FROM categorias_documento
WHERE es_global = true
  AND (modulos_permitidos IS NULL OR modulos_permitidos = '{}')
ORDER BY fecha_creacion DESC;

-- 2. Actualizar categorías sin módulos específicos
-- Asignar 'proyectos' por defecto a las categorías sin módulos
UPDATE categorias_documento
SET modulos_permitidos = ARRAY['proyectos']::text[]
WHERE es_global = true
  AND (modulos_permitidos IS NULL OR modulos_permitidos = '{}');

-- 3. Verificar resultado
SELECT
  id,
  nombre,
  es_global,
  modulos_permitidos,
  fecha_creacion
FROM categorias_documento
WHERE es_global = true
ORDER BY nombre;
