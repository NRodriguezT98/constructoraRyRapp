-- Ver documentos eliminados de clientes (sin filtro es_version_actual)
SELECT
  id,
  titulo,
  estado,
  es_version_actual,
  cliente_id,
  fecha_actualizacion
FROM documentos_cliente
WHERE estado = 'Eliminado'
ORDER BY fecha_actualizacion DESC
LIMIT 10;
