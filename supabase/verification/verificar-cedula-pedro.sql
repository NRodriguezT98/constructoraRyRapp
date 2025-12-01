-- Verificar si la cédula de Pedro Perez se migró correctamente
SELECT
  dc.id,
  dc.titulo,
  dc.es_documento_identidad,
  dc.categoria_id,
  dc.estado,
  dc.url_storage,
  c.nombres,
  c.apellidos,
  c.numero_documento,
  c.documento_identidad_url as "url_antigua"
FROM documentos_cliente dc
JOIN clientes c ON c.id = dc.cliente_id
WHERE c.numero_documento = '12345678'
  AND dc.es_documento_identidad = TRUE;

-- Ver todas las cédulas migradas
SELECT
  COUNT(*) as total_cedulas_migradas
FROM documentos_cliente
WHERE es_documento_identidad = TRUE;
