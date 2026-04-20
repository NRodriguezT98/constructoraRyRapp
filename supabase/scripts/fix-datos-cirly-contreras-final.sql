-- =====================================================
-- FIX DATOS: Cirly Paola Contreras Martínez
-- Fecha: 2026-04-20
-- Negociación: 23709517-7d0c-45e3-b66e-c8c8067598d5
-- Problema: Alguien editó el hipotecario de $93.600.000 → $95.746.670
--   para "cuadrar" el balance, luego ajustaron capital_para_cierre del crédito
--   constructora a $16.253.330, dejándolo desincronizado con
--   creditos_constructora.capital = $18.400.000 (plan real de 12 cuotas × $1.625.333)
--
-- Corrección:
--   1. Hipotecario Banco Caja Social: monto_aprobado $95.746.670 → $93.600.000
--   2. Crédito Constructora: capital_para_cierre $16.253.330 → $18.400.000
--                            monto_aprobado $17.228.530 → $19.504.000
--
-- Balance resultante:
--   $10.000.000 (Cuota Inicial)
--   + $93.600.000 (Hipotecario — correcto)
--   + $18.400.000 (Crédito Constructora capital — sincronizado)
--   = $122.000.000 ✅ = valor vivienda F24
-- =====================================================

BEGIN;

SET LOCAL "request.jwt.claims" = '{"sub": null, "email": "sistema@fix-datos.com", "role": "admin"}';

-- PASO 1: Corregir hipotecario Banco Caja Social
-- ID: 1ab0ce31-e56e-436e-8d8f-8f7a21b254af
UPDATE fuentes_pago
SET monto_aprobado = 93600000
WHERE id = '1ab0ce31-e56e-436e-8d8f-8f7a21b254af'
  AND tipo = 'Crédito Hipotecario'
  AND monto_aprobado = 95746670; -- guard: solo si tiene el valor incorrecto

-- PASO 2: Sincronizar crédito constructora con su plan real
-- ID: e4f5278c-7a14-44cf-9149-7a482b78da3f
-- creditos_constructora: capital=$18.400.000, monto_total=$19.504.000 (12×$1.625.333)
UPDATE fuentes_pago
SET
  monto_aprobado      = 19504000,  -- total con intereses (12 × $1.625.333)
  capital_para_cierre = 18400000   -- capital sin intereses (sincronizado con creditos_constructora)
WHERE id = 'e4f5278c-7a14-44cf-9149-7a482b78da3f'
  AND tipo = 'Crédito con la Constructora'
  AND capital_para_cierre = 16253330; -- guard: solo si tiene el valor incorrecto

-- VERIFICACIÓN post-fix
SELECT
  fp.tipo,
  fp.entidad,
  fp.monto_aprobado::NUMERIC,
  fp.capital_para_cierre::NUMERIC,
  fp.monto_recibido::NUMERIC,
  fp.saldo_pendiente::NUMERIC,
  n.total_fuentes_pago::NUMERIC,
  n.valor_total_pagar::NUMERIC,
  CASE
    WHEN ABS(n.total_fuentes_pago - n.valor_total_pagar) < 1
    THEN '✅ CUADRA'
    ELSE '❌ DESCUADRE: ' || (n.total_fuentes_pago - n.valor_total_pagar)::TEXT
  END AS balance_check
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE fp.negociacion_id = '23709517-7d0c-45e3-b66e-c8c8067598d5'
  AND fp.estado = 'Activa'
ORDER BY fp.tipo;

COMMIT;
