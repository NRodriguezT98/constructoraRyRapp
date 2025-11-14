-- Consulta simple para ver todas las categorías y detectar problemas
SELECT
  id,
  nombre,
  es_global,
  CASE
    WHEN modulos_permitidos IS NULL THEN 'NULL'
    WHEN modulos_permitidos = '{}' THEN 'VACÍO'
    ELSE modulos_permitidos::text
  END as modulos,
  color,
  icono,
  orden,
  LEFT(user_id::text, 8) as user_short,
  fecha_creacion
FROM categorias_documento
ORDER BY
  CASE
    WHEN modulos_permitidos IS NULL THEN 0
    WHEN modulos_permitidos = '{}' THEN 1
    ELSE 2
  END,
  nombre;
