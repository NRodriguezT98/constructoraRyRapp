-- 1. Ver qué tiene Pedro en documento_identidad_url
SELECT
  id,
  nombres,
  apellidos,
  numero_documento,
  documento_identidad_url,
  LENGTH(documento_identidad_url) as longitud_url,
  CASE
    WHEN documento_identidad_url IS NULL THEN 'NULL'
    WHEN documento_identidad_url = '' THEN 'CADENA VACÍA'
    ELSE 'TIENE URL'
  END as estado_campo
FROM clientes
WHERE numero_documento = '12345678';

-- 2. Ver si tiene documentos en documentos_cliente
SELECT
  dc.id,
  dc.titulo,
  dc.es_documento_identidad,
  dc.url_storage
FROM documentos_cliente dc
JOIN clientes c ON c.id = dc.cliente_id
WHERE c.numero_documento = '12345678';
