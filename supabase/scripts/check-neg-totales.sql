SELECT id, valor_total, valor_total_pagar, valor_negociado, total_fuentes_pago, total_abonado, saldo_pendiente
FROM negociaciones
WHERE id = (SELECT negociacion_id FROM fuentes_pago WHERE id = 'e4f5278c-7a14-44cf-9149-7a482b78da3f');
