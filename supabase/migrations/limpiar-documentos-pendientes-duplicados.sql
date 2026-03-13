-- Limpiar documentos pendientes duplicados de Pedrito
-- Cliente: Pedrito Perez Garcia (ID: 8dfeba01-ac6e-4f15-9561-e7039a417beb)

-- Ver documentos pendientes actuales
SELECT
  dp.id,
  dp.tipo_documento,
  fp.tipo as fuente_tipo,
  fp.entidad,
  fp.negociacion_id,
  n.estado as negociacion_estado
FROM documentos_pendientes dp
INNER JOIN fuentes_pago fp ON dp.fuente_pago_id = fp.id
LEFT JOIN negociaciones n ON fp.negociacion_id = n.id
WHERE dp.cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY dp.id DESC;

-- Eliminar documentos pendientes de negociaciones que YA NO EXISTEN
DELETE FROM documentos_pendientes
WHERE fuente_pago_id IN (
  SELECT fp.id
  FROM fuentes_pago fp
  LEFT JOIN negociaciones n ON fp.negociacion_id = n.id
  WHERE n.id IS NULL  -- Negociación eliminada
);

-- Verificar que solo quedan los documentos de la negociación activa
SELECT
  dp.id,
  dp.tipo_documento,
  fp.tipo as fuente_tipo,
  fp.entidad,
  fp.negociacion_id,
  n.estado as negociacion_estado
FROM documentos_pendientes dp
INNER JOIN fuentes_pago fp ON dp.fuente_pago_id = fp.id
LEFT JOIN negociaciones n ON fp.negociacion_id = n.id
WHERE dp.cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY dp.id DESC;
