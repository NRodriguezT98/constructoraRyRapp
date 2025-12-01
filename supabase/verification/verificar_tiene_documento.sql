-- Verificar datos de la vista vista_clientes_resumen
SELECT
  nombre_completo,
  tiene_documento_identidad,
  total_negociaciones,
  negociaciones_activas
FROM vista_clientes_resumen
ORDER BY fecha_creacion DESC
LIMIT 5;

-- Verificar documentos de clientes
SELECT
  c.nombre_completo,
  c.id as cliente_id,
  COUNT(dc.id) as total_documentos,
  COUNT(CASE WHEN (dc.metadata->>'es_documento_identidad')::boolean = true THEN 1 END) as documentos_identidad,
  array_agg(DISTINCT dc.titulo) FILTER (WHERE dc.estado != 'eliminado') as titulos_documentos
FROM clientes c
LEFT JOIN documentos_cliente dc ON dc.cliente_id = c.id AND dc.estado != 'eliminado'
GROUP BY c.id, c.nombre_completo
ORDER BY c.fecha_creacion DESC
LIMIT 5;
