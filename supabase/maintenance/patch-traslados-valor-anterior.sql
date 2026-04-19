-- =============================================================
-- PATCH: Corregir valor_anterior en traslados de vivienda
-- =============================================================
-- Contexto:
--   La primera versión del código guardaba metadata.valor_anterior
--   usando negociaciones.valor_negociado (solo el capital bruto).
--   El campo correcto es valor_total_pagar (calculado por trigger:
--   incluye gastos notariales + recargo esquinera − descuentos).
--
--   Este script corrige TODOS los traslados existentes poniendo
--   el valor_total_pagar de la negociación origen.
--
-- Ejecución: npm run db:exec supabase/maintenance/patch-traslados-valor-anterior.sql
-- =============================================================

-- ── PASO 0: Diagnóstico ────────────────────────────────────
SELECT
  al.id,
  al.fecha_evento,
  (al.metadata->>'valor_anterior')::numeric              AS valor_anterior_actual,
  n_origen.valor_negociado                               AS valor_negociado_origen,
  n_origen.valor_total_pagar                             AS valor_total_pagar_origen,
  CASE
    WHEN (al.metadata->>'valor_anterior')::numeric
         IS DISTINCT FROM n_origen.valor_total_pagar
    THEN 'NECESITA CORRECCIÓN'
    ELSE 'OK'
  END AS estado
FROM audit_log al
JOIN negociaciones n_origen
  ON n_origen.id = (al.metadata->>'negociacion_origen_id')::uuid
WHERE al.tabla  = 'negociaciones'
  AND al.accion = 'CREATE'
  AND al.metadata->>'tipo' = 'TRASLADO_VIVIENDA'
ORDER BY al.fecha_evento DESC;

-- ── PASO 1: Corregir valor_anterior ───────────────────────
UPDATE audit_log al
SET metadata = al.metadata
  || jsonb_build_object('valor_anterior', n_origen.valor_total_pagar)
FROM negociaciones n_origen
WHERE al.tabla  = 'negociaciones'
  AND al.accion = 'CREATE'
  AND al.metadata->>'tipo' = 'TRASLADO_VIVIENDA'
  AND n_origen.id = (al.metadata->>'negociacion_origen_id')::uuid
  AND (al.metadata->>'valor_anterior')::numeric
      IS DISTINCT FROM n_origen.valor_total_pagar;

-- ── PASO 2: Verificación ──────────────────────────────────
SELECT
  al.id,
  al.fecha_evento,
  al.metadata->>'vivienda_origen_numero'  AS casa_origen,
  al.metadata->>'vivienda_destino_numero' AS casa_destino,
  (al.metadata->>'valor_anterior')::numeric AS valor_anterior_corregido,
  (al.metadata->>'valor_nuevo')::numeric    AS valor_nuevo,
  n_origen.valor_total_pagar                AS valor_total_pagar_origen
FROM audit_log al
JOIN negociaciones n_origen
  ON n_origen.id = (al.metadata->>'negociacion_origen_id')::uuid
WHERE al.tabla  = 'negociaciones'
  AND al.accion = 'CREATE'
  AND al.metadata->>'tipo' = 'TRASLADO_VIVIENDA'
ORDER BY al.fecha_evento DESC;
