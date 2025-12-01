-- Verificar categorías de clientes
SELECT
  nombre,
  descripcion,
  color,
  icono,
  modulos_permitidos,
  orden
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
ORDER BY orden;
