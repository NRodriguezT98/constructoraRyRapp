-- ============================================================
-- CORRECCIÓN: Reset monto_recibido en fuentes_pago
--
-- CAUSA: La migración 20260312 usó TRUNCATE en abonos_historial,
-- lo cual NO dispara triggers row-level (DELETE trigger no corre).
-- Efecto: fuentes_pago.monto_recibido quedó con valores antiguos
-- aunque abonos_historial está vacío. Esto causa que
-- negociaciones.total_abonado muestre valores inconsistentes.
--
-- LA SOLUCIÓN: Resetear monto_recibido = 0 en todas las fuentes.
-- Esto disparará trigger_update_negociaciones_totales que
-- recalculará total_abonado, saldo_pendiente y porcentaje_pagado
-- en la tabla negociaciones.
-- ============================================================

-- 1. Resetear monto_recibido en todas las fuentes de pago
--    (el trigger update_negociaciones_totales se disparará automáticamente)
UPDATE fuentes_pago
SET monto_recibido = 0
WHERE monto_recibido != 0;

-- 2. Verificar resultado (diagnóstico)
SELECT
  fp.id,
  fp.tipo,
  fp.monto_aprobado,
  fp.monto_recibido,
  fp.saldo_pendiente,
  n.total_abonado AS negociacion_total_abonado,
  n.porcentaje_pagado
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
ORDER BY fp.tipo;
