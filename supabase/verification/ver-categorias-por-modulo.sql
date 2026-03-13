-- Ver todas las categorías actuales por módulo
SELECT
  CASE
    WHEN 'clientes' = ANY(modulos_permitidos) THEN 'CLIENTES'
    WHEN 'proyectos' = ANY(modulos_permitidos) THEN 'PROYECTOS'
    WHEN 'viviendas' = ANY(modulos_permitidos) THEN 'VIVIENDAS'
    ELSE 'OTROS'
  END as modulo,
  id,
  nombre,
  descripcion,
  color,
  icono,
  es_sistema
FROM categorias_documento
ORDER BY
  CASE
    WHEN 'clientes' = ANY(modulos_permitidos) THEN 1
    WHEN 'proyectos' = ANY(modulos_permitidos) THEN 2
    WHEN 'viviendas' = ANY(modulos_permitidos) THEN 3
    ELSE 4
  END,
  nombre;
