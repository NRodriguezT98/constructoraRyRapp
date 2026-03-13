-- Ver solo documentos pendientes y últimos documentos subidos para comparar metadata
SELECT
  'PENDIENTE' AS tipo,
  dp.tipo_documento AS descripcion,
  dp.metadata->>'tipo_fuente' AS tipo_fuente,
  dp.metadata->>'entidad' AS entidad,
  dp.fecha_creacion::text AS fecha
FROM documentos_pendientes dp
WHERE dp.estado = 'Pendiente'
ORDER BY dp.fecha_creacion DESC
LIMIT 5

UNION ALL

SELECT
  'DOCUMENTO_SUBIDO' AS tipo,
  dc.titulo AS descripcion,
  dc.metadata->>'tipo_fuente' AS tipo_fuente,
  dc.metadata->>'entidad' AS entidad,
  dc.fecha_creacion::text AS fecha
FROM documentos_cliente dc
WHERE dc.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34'
ORDER BY dc.fecha_creacion DESC
LIMIT 5;
