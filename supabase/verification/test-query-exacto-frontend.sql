-- Simular EXACTAMENTE el query del frontend
SELECT *
FROM documentos_cliente
WHERE cliente_id = 'af1b4e40-2fa0-4a62-8d95-421737a3c83b'
  AND estado = 'Activo'
  AND es_version_actual = true
ORDER BY es_importante DESC, fecha_creacion DESC;

-- Ver TODOS los documentos de Pedro (sin filtros)
SELECT
    id,
    titulo,
    estado,
    es_version_actual,
    es_importante,
    es_documento_identidad,
    fecha_creacion
FROM documentos_cliente
WHERE cliente_id = 'af1b4e40-2fa0-4a62-8d95-421737a3c83b';
