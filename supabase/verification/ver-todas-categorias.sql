-- Verificar TODAS las categorías en la base de datos
SELECT
  id,
  nombre,
  modulos_permitidos,
  es_global,
  orden,
  color,
  icono
FROM categorias_documento
ORDER BY orden;
