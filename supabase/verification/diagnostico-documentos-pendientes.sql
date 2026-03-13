-- Ver estructura de documentos_pendientes
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'documentos_pendientes'
ORDER BY ordinal_position;

-- Ver documentos pendientes de Pedrito
SELECT
  dp.id,
  dp.cliente_id,
  dp.fuente_pago_id,
  dp.tipo_documento,
  fp.negociacion_id,
  n.estado
FROM documentos_pendientes dp
LEFT JOIN fuentes_pago fp ON dp.fuente_pago_id = fp.id
LEFT JOIN negociaciones n ON fp.negociacion_id = n.id
WHERE dp.cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY dp.id;
