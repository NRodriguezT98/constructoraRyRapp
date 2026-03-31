-- Verificar categorías de documentos para clientes
SELECT
  id,
  nombre,
  descripcion,
  color,
  icono,
  modulos_permitidos,
  orden,
  es_global
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
ORDER BY orden;
