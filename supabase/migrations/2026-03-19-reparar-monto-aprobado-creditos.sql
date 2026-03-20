-- ============================================================
-- REPARAR monto_aprobado en fuentes de crédito constructora
-- ============================================================
-- Problema: reestructurarCredito() actualizaba monto_aprobado al
-- total del nuevo plan (capital + interés), corrompiendo el campo.
-- monto_aprobado para créditos debe = capital_para_cierre (el capital
-- original del crédito, sin intereses).
-- ============================================================

-- Ver cuántos registros están afectados
SELECT
  fp.id,
  fp.tipo,
  fp.monto_aprobado         AS monto_aprobado_actual,
  fp.capital_para_cierre    AS capital_correcto,
  fp.monto_recibido,
  fp.capital_para_cierre - fp.monto_recibido AS saldo_correcto
FROM fuentes_pago fp
WHERE fp.capital_para_cierre IS NOT NULL
  AND fp.monto_aprobado IS DISTINCT FROM fp.capital_para_cierre;

-- Reparar: monto_aprobado = capital_para_cierre
UPDATE fuentes_pago
SET monto_aprobado = capital_para_cierre
WHERE capital_para_cierre IS NOT NULL
  AND monto_aprobado IS DISTINCT FROM capital_para_cierre;

-- Verificar resultado
SELECT
  fp.id,
  fp.tipo,
  fp.monto_aprobado,
  fp.capital_para_cierre,
  fp.monto_recibido,
  fp.saldo_pendiente,
  CASE WHEN fp.monto_aprobado = fp.capital_para_cierre THEN 'OK' ELSE 'PENDIENTE' END AS estado
FROM fuentes_pago fp
WHERE fp.capital_para_cierre IS NOT NULL;
