-- 🔍 VERIFICAR PENDIENTES HUÉRFANOS
-- Buscar documentos_pendientes cuya fuente_pago ya NO existe

SELECT
  dp.id as pendiente_id,
  dp.tipo_documento,
  dp.metadata->>'tipo_fuente' as tipo_fuente,
  dp.metadata->>'entidad' as entidad,
  dp.fuente_pago_id,
  dp.estado,
  dp.fecha_creacion,
  CASE
    WHEN fp.id IS NULL THEN '❌ HUÉRFANO (fuente eliminada)'
    ELSE '✅ Válido'
  END as validez,
  c.nombres || ' ' || c.apellidos as cliente_nombre
FROM documentos_pendientes dp
LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
LEFT JOIN clientes c ON c.id = dp.cliente_id
WHERE dp.estado = 'Pendiente'
ORDER BY dp.fecha_creacion DESC;
