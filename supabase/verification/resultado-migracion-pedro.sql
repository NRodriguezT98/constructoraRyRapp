-- Verificar resultado de la migración
SELECT
  'DATOS CLIENTE' as seccion,
  c.nombres,
  c.apellidos,
  c.numero_documento,
  CASE
    WHEN c.documento_identidad_url IS NULL THEN '❌ NULL'
    WHEN c.documento_identidad_url = '' THEN '❌ VACÍO'
    ELSE '✅ ' || LEFT(c.documento_identidad_url, 60)
  END as url_antigua
FROM clientes c
WHERE c.numero_documento = '12345678'

UNION ALL

SELECT
  'DOCUMENTO MIGRADO' as seccion,
  dc.titulo,
  dc.categoria_id::text,
  CASE WHEN dc.es_documento_identidad THEN '✅ SÍ' ELSE '❌ NO' END,
  dc.url_storage
FROM documentos_cliente dc
JOIN clientes c ON c.id = dc.cliente_id
WHERE c.numero_documento = '12345678'
AND dc.es_documento_identidad = TRUE;
