SELECT fp.id, fp.tipo, fp.entidad, fp.monto_aprobado, fp.capital_para_cierre, fp.monto_recibido, fp.saldo_pendiente, n.valor_total, n.total_fuentes_pago
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE n.id = (SELECT negociacion_id FROM fuentes_pago WHERE id = 'e4f5278c-7a14-44cf-9149-7a482b78da3f')
ORDER BY fp.created_at;
