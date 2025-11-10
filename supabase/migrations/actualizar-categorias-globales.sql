-- ============================================
-- ACTUALIZAR CATEGORÍAS A GLOBALES
-- ============================================
-- Descripción: Convierte las categorías existentes en globales
-- Fecha: 2025-11-10

-- Actualizar categorías existentes de proyectos a globales
UPDATE categorias_documento
SET es_global = true
WHERE 'proyectos' = ANY(modulos_permitidos)
  AND es_global = false;

-- Verificar resultado
SELECT
  id,
  nombre,
  es_global,
  modulos_permitidos,
  user_id
FROM categorias_documento
WHERE 'proyectos' = ANY(modulos_permitidos)
ORDER BY orden;
