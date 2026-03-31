-- 🔍 DIAGNÓSTICO VINCULACIÓN CARTA COMFANDI - VERSIÓN SIMPLIFICADA
-- ✅ Nombres verificados en: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
-- Este script retorna resultados visibles

-- 1️⃣ DOCUMENTOS PENDIENTES ACTIVOS
SELECT
  'PENDIENTES' as tipo_resultado,
  dp.id,
  dp.tipo_documento,
  dp.estado,
  dp.metadata->>'tipo_fuente' as metadata_tipo_fuente,
  dp.metadata->>'entidad' as metadata_entidad,
  c.nombres || ' ' || c.apellidos as cliente_nombre,
  dp.fecha_creacion
FROM documentos_pendientes dp
LEFT JOIN clientes c ON c.id = dp.cliente_id
WHERE dp.estado = 'Pendiente'
ORDER BY dp.fecha_creacion DESC
LIMIT 5;
