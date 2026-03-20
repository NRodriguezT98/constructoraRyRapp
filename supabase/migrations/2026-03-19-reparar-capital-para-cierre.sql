-- ============================================================
-- REPARACIÓN: capital_para_cierre corrupto por bug en reestructuración
-- ============================================================
-- El bug en reestructurarCredito() (ya corregido en código) sobreescribía
-- capital_para_cierre con el capital pendiente al momento de reestructurar,
-- en vez de preservar el capital original del crédito.
--
-- Este script restaura el valor correcto desde creditos_constructora.capital.
-- ============================================================

-- 1. Diagnóstico: ver fuentes con capital_para_cierre corrupto
SELECT
  fp.id AS fuente_id,
  fp.tipo,
  fp.monto_aprobado,
  fp.capital_para_cierre AS capital_cierre_actual,
  cc.capital AS capital_original_credito,
  CASE
    WHEN fp.capital_para_cierre IS DISTINCT FROM cc.capital
    THEN '⚠️ CORRUPTO'
    ELSE '✅ OK'
  END AS estado
FROM fuentes_pago fp
JOIN creditos_constructora cc ON cc.fuente_pago_id = fp.id
ORDER BY fp.fecha_creacion;

-- 2. Reparar: restaurar capital_para_cierre al capital original del crédito
UPDATE fuentes_pago fp
SET capital_para_cierre = cc.capital
FROM creditos_constructora cc
WHERE cc.fuente_pago_id = fp.id
  AND fp.capital_para_cierre IS DISTINCT FROM cc.capital;

-- 3. Verificación post-reparación
SELECT
  fp.id AS fuente_id,
  fp.tipo,
  fp.capital_para_cierre,
  cc.capital,
  fp.capital_para_cierre = cc.capital AS correcto
FROM fuentes_pago fp
JOIN creditos_constructora cc ON cc.fuente_pago_id = fp.id;
