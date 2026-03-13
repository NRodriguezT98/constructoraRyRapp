-- Ver documentos pendientes de Pedrito DESPUÉS de la limpieza
SELECT
  dp.id,
  dp.tipo_documento,
  fp.tipo as fuente_tipo,
  fp.entidad,
  n.id as negociacion_id,
  n.estado as negociacion_estado
FROM documentos_pendientes dp
INNER JOIN fuentes_pago fp ON dp.fuente_pago_id = fp.id
INNER JOIN negociaciones n ON fp.negociacion_id = n.id
WHERE dp.cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY fp.tipo, dp.tipo_documento;
