-- 🧹 LIMPIAR PENDIENTES HUÉRFANOS MANUALMENTE
-- Eliminar documentos_pendientes cuya fuente_pago ya NO existe

-- 1️⃣ Ver cuántos hay
SELECT COUNT(*) as pendientes_huerfanos
FROM documentos_pendientes dp
LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
WHERE dp.estado = 'Pendiente'
  AND fp.id IS NULL;

-- 2️⃣ Eliminarlos
DELETE FROM documentos_pendientes
WHERE id IN (
  SELECT dp.id
  FROM documentos_pendientes dp
  LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
  WHERE dp.estado = 'Pendiente'
    AND fp.id IS NULL
);

-- 3️⃣ Confirmar limpieza
SELECT
  'Después de limpieza' as estado,
  COUNT(*) as pendientes_restantes
FROM documentos_pendientes
WHERE estado = 'Pendiente';
