-- Contar documentos pendientes por fuente_pago_id
SELECT
  fp.tipo as fuente_tipo,
  fp.entidad,
  COUNT(dp.id) as cantidad_docs,
  STRING_AGG(dp.id::text, ', ') as doc_ids
FROM fuentes_pago fp
LEFT JOIN documentos_pendientes dp ON dp.fuente_pago_id = fp.id
WHERE fp.negociacion_id = 'faa506ea-41ff-4f51-8479-21686deb93e8'
GROUP BY fp.id, fp.tipo, fp.entidad
ORDER BY fp.tipo;
