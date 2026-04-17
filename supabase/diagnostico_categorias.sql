SELECT id, nombre, es_sistema, orden, icono, color
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
ORDER BY es_sistema DESC, orden, nombre;
