-- 🧹 LIMPIAR PENDIENTE HUÉRFANO MI CASA YA
-- Eliminar el pendiente que ya no tiene fuente_pago asociada

-- Ver cuántos hay
SELECT COUNT(*) as total_huerfanos
FROM documentos_pendientes dp
LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
WHERE dp.estado = 'Pendiente'
  AND fp.id IS NULL;

-- Eliminarlos todos
DELETE FROM documentos_pendientes
WHERE id IN (
  SELECT dp.id
  FROM documentos_pendientes dp
  LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
  WHERE dp.estado = 'Pendiente'
    AND fp.id IS NULL
)
RETURNING id, tipo_documento, metadata->>'tipo_fuente' as tipo_fuente;
