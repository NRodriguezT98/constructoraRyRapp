-- Comparar categorías entre los 3 módulos
SELECT
  nombre,
  descripcion,
  modulos_permitidos,
  color,
  icono,
  orden
FROM categorias_documento
WHERE 'proyectos' = ANY(modulos_permitidos)
   OR 'viviendas' = ANY(modulos_permitidos)
   OR 'clientes' = ANY(modulos_permitidos)
ORDER BY
  CASE
    WHEN 'proyectos' = ANY(modulos_permitidos) THEN 1
    WHEN 'viviendas' = ANY(modulos_permitidos) THEN 2
    WHEN 'clientes' = ANY(modulos_permitidos) THEN 3
  END,
  orden;
