-- Ver documentos pendientes actuales de Pedrito con sus relaciones
SELECT
  dp.id as doc_id,
  dp.cliente_id,
  dp.fuente_pago_id,
  dp.tipo_documento,
  fp.tipo as fuente_tipo,
  fp.negociacion_id,
  n.estado as negociacion_estado,
  CASE
    WHEN n.id IS NULL THEN '❌ HUÉRFANO (negociación eliminada)'
    ELSE '✅ OK'
  END as estado_doc
FROM documentos_pendientes dp
LEFT JOIN fuentes_pago fp ON dp.fuente_pago_id = fp.id
LEFT JOIN negociaciones n ON fp.negociacion_id = n.id
WHERE dp.cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY dp.id;
