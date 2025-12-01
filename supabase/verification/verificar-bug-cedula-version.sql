-- Verificar si nueva versión de cédula mantiene el flag es_documento_identidad
-- Bug: Nueva versión pierde el flag, dejando al cliente sin documento de identidad activo

SELECT
  id,
  titulo,
  version,
  es_version_actual,
  es_documento_identidad,
  documento_padre_id,
  estado
FROM documentos_cliente
WHERE cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
ORDER BY
  es_documento_identidad DESC,
  version ASC;
