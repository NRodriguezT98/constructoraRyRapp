-- Verificar que el documento tenga entidad COMFANDI
SELECT
  id,
  titulo,
  metadata->>'tipo_fuente' as tipo_fuente,
  metadata->>'entidad' as entidad,
  metadata->>'monto_aprobado' as monto_aprobado,
  metadata
FROM documentos_cliente
WHERE titulo LIKE '%Carta de Aprobación Subsidio Caja Compensación%'
ORDER BY fecha_creacion DESC;
