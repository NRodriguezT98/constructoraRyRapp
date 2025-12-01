-- Verificar si el documento tiene el flag es_documento_identidad
SELECT
  id,
  titulo,
  nombre_archivo,
  es_documento_identidad,
  categoria_id,
  fecha_creacion
FROM documentos_cliente
WHERE cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
ORDER BY fecha_creacion DESC;
