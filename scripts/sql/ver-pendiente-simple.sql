-- 🔍 DIAGNÓSTICO SIMPLE: Ver pendiente Mi Casa Ya

SELECT
  dp.id,
  dp.tipo_documento,
  dp.fuente_pago_id,
  dp.estado,
  dp.metadata->>'tipo_fuente' as tipo_fuente_meta,
  dp.metadata->>'entidad' as entidad_meta,
  CASE
    WHEN fp.id IS NULL THEN 'HUERFANO'
    ELSE 'TIENE_FUENTE'
  END as validez
FROM documentos_pendientes dp
LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
WHERE dp.estado = 'Pendiente'
  AND (dp.tipo_documento ILIKE '%mi casa ya%'
       OR dp.metadata->>'tipo_fuente' ILIKE '%mi casa ya%')
LIMIT 5;
