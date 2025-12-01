-- Verificar documentos en sistema de documentos_cliente
SELECT
  d.id,
  d.titulo,
  d.nombre_archivo,
  d.ruta_storage,
  d.categoria_id,
  cat.nombre as categoria_nombre,
  d.es_eliminado,
  d.fecha_creacion
FROM documentos_cliente d
LEFT JOIN categorias_documentos_cliente cat ON d.categoria_id = cat.id
WHERE d.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
ORDER BY d.fecha_creacion DESC;
