-- Verificar documentos_cliente correctamente
SELECT
  id,
  titulo,
  nombre_archivo,
  url_storage,
  categoria_id,
  es_eliminado,
  fecha_creacion
FROM documentos_cliente
WHERE cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
ORDER BY fecha_creacion DESC;
