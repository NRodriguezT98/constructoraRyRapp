-- Backfill fuentes_pago desde creditos_constructora
-- Para cr\u00e9ditos ya configurados donde capital_para_cierre sigue siendo NULL
-- (creados antes de que crearCredito sincronizara autom\u00e1ticamente).

UPDATE fuentes_pago fp
SET
  capital_para_cierre = cc.capital,
  monto_aprobado      = cc.monto_total
FROM creditos_constructora cc
WHERE cc.fuente_pago_id = fp.id
  AND fp.capital_para_cierre IS NULL;

-- Verificar resultado
SELECT
  fp.id,
  fp.tipo,
  fp.monto_aprobado,
  fp.capital_para_cierre,
  cc.capital,
  cc.monto_total
FROM fuentes_pago fp
JOIN creditos_constructora cc ON cc.fuente_pago_id = fp.id
ORDER BY fp.fecha_creacion;
