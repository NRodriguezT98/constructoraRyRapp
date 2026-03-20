SELECT fp.tipo, fp.monto_aprobado, fp.capital_para_cierre, cc.capital, cc.interes_total, cc.monto_total, fp.monto_recibido, fp.saldo_pendiente
FROM fuentes_pago fp JOIN creditos_constructora cc ON cc.fuente_pago_id = fp.id;
