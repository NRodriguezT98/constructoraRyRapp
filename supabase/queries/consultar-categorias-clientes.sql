-- ============================================
-- CONSULTAR CATEGORÍAS ACTUALES DE CLIENTES
-- ============================================
-- Obtiene snapshot de las categorías existentes para clientes
-- con todos sus atributos (id, nombre, color, icono, etc.)
-- ============================================

SELECT
  id,
  nombre,
  descripcion,
  color,
  icono,
  modulos_permitidos,
  es_global,
  es_sistema,
  orden
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
  OR nombre IN ('Documentos de Identidad', 'Cartas de Aprobación')
ORDER BY orden, nombre;
