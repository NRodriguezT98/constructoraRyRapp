-- Ver descripción completa de metadata
SELECT
  dp.id,
  fp.tipo as fuente_tipo,
  dp.metadata->>'descripcion' as descripcion,
  dp.metadata->>'entidad' as entidad
FROM documentos_pendientes dp
INNER JOIN fuentes_pago fp ON dp.fuente_pago_id = fp.id
WHERE dp.cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY fp.tipo;
