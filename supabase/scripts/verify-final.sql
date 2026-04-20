SELECT fp.tipo, fp.entidad, fp.monto_aprobado::NUMERIC, fp.capital_para_cierre::NUMERIC, fp.monto_recibido::NUMERIC, n.total_fuentes_pago::NUMERIC, n.valor_total_pagar::NUMERIC
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE fp.negociacion_id = '23709517-7d0c-45e3-b66e-c8c8067598d5'
  AND fp.estado = 'Activa'
ORDER BY fp.tipo;
