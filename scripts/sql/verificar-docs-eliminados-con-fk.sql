-- Verificar documentos eliminados con nuevo FK
SELECT
  dc.id,
  dc.titulo,
  dc.estado,
  dc.es_version_actual,
  dc.subido_por,
  c.nombres || ' ' || c.apellidos as cliente_nombre,
  u.nombres || ' ' || u.apellidos as usuario_nombre
FROM documentos_cliente dc
LEFT JOIN clientes c ON dc.cliente_id = c.id
LEFT JOIN usuarios u ON dc.subido_por = u.id
WHERE dc.estado = 'Eliminado'
ORDER BY dc.fecha_actualizacion DESC
LIMIT 10;
