-- ============================================================
-- Fix: monto_aprobado debe ser la DEUDA TOTAL (capital + intereses)
-- Date: 2026-03-19
--
-- Contexto:
--   monto_aprobado = deuda total → saldo_pendiente refleja lo que realmente debe
--   capital_para_cierre = capital puro → para balance de la negociación
--   El trigger update_negociaciones_totales ya usa COALESCE(capital_para_cierre, monto_aprobado)
--   para que los intereses no inflen el progreso por encima del valor de la vivienda.
--
-- Este script revierte el error de igualar monto_aprobado = capital_para_cierre
-- para créditos que tienen plan configurado.
-- ============================================================

-- Actualizar monto_aprobado = monto_total del crédito (capital + intereses)
UPDATE fuentes_pago fp
SET monto_aprobado = cc.monto_total
FROM creditos_constructora cc
WHERE cc.fuente_pago_id = fp.id
  AND fp.monto_aprobado != cc.monto_total;

-- Verificación
SELECT
  fp.id AS fuente_id,
  fp.tipo,
  fp.monto_aprobado AS "deuda_total (monto_aprobado)",
  fp.capital_para_cierre AS "capital (para_cierre)",
  cc.capital,
  cc.interes_total,
  cc.monto_total AS "credito_monto_total",
  fp.monto_recibido,
  fp.saldo_pendiente,
  CASE
    WHEN fp.monto_aprobado = cc.monto_total THEN '✅ OK'
    ELSE '❌ DESINCRONIZADO'
  END AS estado_sync
FROM fuentes_pago fp
JOIN creditos_constructora cc ON cc.fuente_pago_id = fp.id;
