-- Exportar TODAS las categorías actuales del sistema para crear seed completo
SELECT
  'INSERT INTO categorias_documento (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema) VALUES (' ||
  '''' || id || '''::uuid, ' ||
  '''' || REPLACE(nombre, '''', '''''') || ''', ' ||
  COALESCE('''' || REPLACE(descripcion, '''', '''''') || '''', 'NULL') || ', ' ||
  '''' || color || ''', ' ||
  '''' || icono || ''', ' ||
  'ARRAY[' || (
    SELECT STRING_AGG('''' || modulo || '''', ', ')
    FROM UNNEST(modulos_permitidos) AS modulo
  ) || '], ' ||
  CASE WHEN es_sistema THEN 'true' ELSE 'false' END ||
  ') ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;'
FROM categorias_documento
ORDER BY
  CASE
    WHEN 'clientes' = ANY(modulos_permitidos) THEN 1
    WHEN 'proyectos' = ANY(modulos_permitidos) THEN 2
    WHEN 'viviendas' = ANY(modulos_permitidos) THEN 3
    ELSE 4
  END,
  nombre;
