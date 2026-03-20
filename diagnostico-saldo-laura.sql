-- Estado actual de fuentes de Laura Duque (CC 1234567)
SELECT
  fp.tipo,
  fp.monto_aprobado,
  fp.capital_para_cierre,
  fp.monto_recibido,
  fp.saldo_pendiente,
  n.valor_total
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN clientes c ON c.id = n.cliente_id
WHERE c.numero_documento = '1234567'
ORDER BY fp.tipo;
