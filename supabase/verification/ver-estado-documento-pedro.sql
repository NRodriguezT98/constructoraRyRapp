-- Ver estado exacto del documento de Pedro
SELECT
  dc.id,
  dc.titulo,
  dc.estado,
  dc.es_documento_identidad,
  dc.es_version_actual,
  LENGTH(dc.estado) as longitud,
  ascii(substring(dc.estado, 1, 1)) as primer_char_ascii
FROM documentos_cliente dc
JOIN clientes c ON c.id = dc.cliente_id
WHERE c.numero_documento = '12345678';
