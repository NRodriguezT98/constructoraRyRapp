-- ============================================
-- MIGRAR FUENTES DE PEDRITO a "En Proceso"
-- ============================================

-- Actualizar las 4 fuentes de Pedrito a estado "En Proceso"
UPDATE fuentes_pago fp
SET estado = 'En Proceso'
FROM negociaciones n
WHERE fp.negociacion_id = n.id
  AND n.cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'  -- Pedrito
  AND fp.estado = 'Pendiente';

-- Verificar cambios
SELECT
  'FUENTES ACTUALIZADAS' as resultado,
  fp.id,
  fp.tipo,
  fp.entidad,
  fp.estado
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE n.cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY fp.tipo;

-- Ver documentos pendientes en la vista
SELECT
  'DOCUMENTOS PENDIENTES' as resultado,
  COUNT(*) as total_pendientes
FROM vista_documentos_pendientes_fuentes
WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb';

-- Detalle de pendientes
SELECT
  'DETALLE PENDIENTES' as resultado,
  tipo_documento,
  tipo_fuente,
  entidad,
  nivel_validacion,
  prioridad
FROM vista_documentos_pendientes_fuentes
WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY nivel_validacion, tipo_fuente, tipo_documento;
