-- Query simple para ver pendiente
SELECT
  id,
  tipo_documento,
  fuente_pago_id,
  estado,
  fecha_creacion::text,
  (metadata->>'tipo_fuente')::text as tipo_fuente_metadata
FROM documentos_pendientes
WHERE cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND estado = 'Pendiente';
