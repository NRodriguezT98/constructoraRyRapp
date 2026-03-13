-- Consultar todas las categorías de documentos existentes
SELECT
  id,
  nombre,
  descripcion,
  color,
  icono,
  modulos_permitidos,
  es_sistema
FROM categorias_documento
ORDER BY nombre;
