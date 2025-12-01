-- Verificar estado y es_version_actual de documentos
SELECT
  id,
  titulo,
  nombre_archivo,
  estado,
  es_version_actual,
  es_documento_identidad,
  fecha_creacion
FROM documentos_cliente
WHERE cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
ORDER BY fecha_creacion DESC;
