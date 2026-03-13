-- Buscar categoría relacionada con escrituras
SELECT
  id,
  nombre,
  descripcion,
  modulos_permitidos
FROM categorias_documento
WHERE
  LOWER(nombre) LIKE '%escritura%'
  OR LOWER(descripcion) LIKE '%escritura%'
  OR nombre = 'Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso'
ORDER BY nombre;
