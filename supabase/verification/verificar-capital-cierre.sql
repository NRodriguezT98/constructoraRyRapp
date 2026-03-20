-- Verificar estado actual de capital_para_cierre para todos los créditos
SELECT
  fp.id AS fuente_id,
  fp.tipo,
  fp.monto_aprobado,
  fp.capital_para_cierre,
  cc.capital AS capital_credito,
  fp.capital_para_cierre = cc.capital AS correcto,
  n.id AS negociacion_id
FROM fuentes_pago fp
JOIN creditos_constructora cc ON cc.fuente_pago_id = fp.id
LEFT JOIN negociaciones n ON n.id = fp.negociacion_id
ORDER BY fp.fecha_creacion;
