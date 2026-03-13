-- Limpieza manual: eliminar pendientes de fuentes inactivas EXISTENTES
DELETE FROM documentos_pendientes
WHERE fuente_pago_id IN (
  SELECT id FROM fuentes_pago WHERE estado_fuente = 'inactiva'
)
AND estado = 'Pendiente';
