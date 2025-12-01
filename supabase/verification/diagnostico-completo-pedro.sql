-- Diagnóstico completo: Por qué no aparece el documento de Pedro
SELECT
  '1. CLIENTE' as seccion,
  c.id as cliente_id,
  c.nombres,
  c.numero_documento
FROM clientes c
WHERE c.numero_documento = '12345678'

UNION ALL

SELECT
  '2. DOCUMENTO EN BD' as seccion,
  dc.id,
  dc.titulo,
  dc.estado
FROM documentos_cliente dc
JOIN clientes c ON c.id = dc.cliente_id
WHERE c.numero_documento = '12345678'

UNION ALL

SELECT
  '3. TEST QUERY EXACTA' as seccion,
  dc.id,
  dc.titulo,
  CASE WHEN dc.estado ILIKE 'activo' THEN 'MATCH ✅' ELSE 'NO MATCH ❌' END
FROM documentos_cliente dc
JOIN clientes c ON c.id = dc.cliente_id
WHERE c.numero_documento = '12345678'
  AND dc.es_version_actual = true;
