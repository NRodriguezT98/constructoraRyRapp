-- 🔍 VER DOCUMENTOS RECIÉN SUBIDOS
-- Verificar si el documento de Comfandi está subido con metadata correcta

SELECT
  'DOCUMENTOS_SUBIDOS' as tipo_resultado,
  dc.id,
  dc.titulo,
  dc.nombre_archivo,
  dc.metadata->>'tipo_fuente' as metadata_tipo_fuente,
  dc.metadata->>'entidad' as metadata_entidad,
  dc.metadata->>'fuente_pago_id' as metadata_fuente_pago_id,
  c.nombres || ' ' || c.apellidos as cliente_nombre,
  dc.fecha_creacion
FROM documentos_cliente dc
LEFT JOIN clientes c ON c.id = dc.cliente_id
WHERE dc.fecha_creacion > NOW() - INTERVAL '4 hours'
  OR dc.titulo ILIKE '%comfandi%'
  OR dc.metadata->>'entidad' = 'Comfandi'
ORDER BY dc.fecha_creacion DESC
LIMIT 10;
