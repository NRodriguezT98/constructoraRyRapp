-- Ver solo las categorías de Clientes para análisis
SELECT
  nombre,
  descripcion,
  color,
  icono,
  orden
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
ORDER BY orden;
