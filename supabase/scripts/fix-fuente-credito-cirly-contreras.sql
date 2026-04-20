-- ============================================================
-- Fix puntual: Sincronizar fuentes_pago con creditos_constructora
-- para el crédito de Cirly Paola Contreras (vivienda F24)
--
-- Problema: fuentes_pago.monto_aprobado y capital_para_cierre
-- quedaron desactualizados (probablemente por una reestructuración
-- ejecutada con parámetros incorrectos). creditos_constructora
-- tiene los valores correctos.
--
-- Fix: actualizar fuentes_pago con los valores del plan real:
--   monto_aprobado     = 12 × $1.625.333 = $19.503.996
--   capital_para_cierre = $18.400.000 (capital del crédito)
--
-- Resultado esperado:
--   saldo_pendiente (GENERATED) = $19.503.996 - $16.253.330 = $3.250.666
--   (= 2 cuotas pendientes de $1.625.333 c/u ✅)
-- ============================================================

-- 3. Verificar resultado FINAL
SELECT
  fp.id AS fuente_pago_id,
  fp.monto_aprobado,
  fp.capital_para_cierre,
  fp.monto_recibido,
  fp.saldo_pendiente,
  cc.capital AS capital_credito,
  cc.monto_total AS monto_total_credito,
  cc.num_cuotas,
  cc.valor_cuota
FROM fuentes_pago fp
JOIN creditos_constructora cc ON cc.fuente_pago_id = fp.id
WHERE fp.id = 'e4f5278c-7a14-44cf-9149-7a482b78da3f';

-- 2. Aplicar el fix usando ID exacto (verificado en el paso anterior)
-- fuente_pago_id: e4f5278c-7a14-44cf-9149-7a482b78da3f
--
-- Nota: Se requiere SET LOCAL del JWT porque el trigger negociaciones_audit_trigger
-- lee request.jwt.claims para obtener usuario_email (NOT NULL).
-- Sin esto, el UPDATE de negociaciones lanzaría null constraint violation.
BEGIN;

SET LOCAL "request.jwt.claims" = '{"sub": null, "email": "sistema@corrección-datos.com", "role": "admin"}';

UPDATE fuentes_pago
SET
  monto_aprobado      = cc.monto_total,   -- $19.503.996 (plan total real: 12 × $1.625.333)
  capital_para_cierre = cc.capital        -- $18.400.000 (capital puro del crédito)
FROM creditos_constructora cc
WHERE
  fuentes_pago.id = 'e4f5278c-7a14-44cf-9149-7a482b78da3f'
  AND cc.fuente_pago_id = fuentes_pago.id
RETURNING
  fuentes_pago.id,
  fuentes_pago.monto_aprobado        AS monto_aprobado_nuevo,
  fuentes_pago.capital_para_cierre   AS capital_para_cierre_nuevo,
  fuentes_pago.monto_recibido,
  fuentes_pago.saldo_pendiente       AS saldo_pendiente_nuevo;

COMMIT;
