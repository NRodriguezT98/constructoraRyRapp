-- =============================================================
-- BACKFILL: Eventos de traslado de vivienda sin cliente_id
-- =============================================================
-- Contexto:
--   Antes de la implementación del historial de traslados, los eventos
--   en audit_log (tabla='negociaciones', accion='CREATE', tipo='TRASLADO_VIVIENDA')
--   no incluían cliente_id en metadata → el historial del cliente no los encontraba.
--
--   Este script:
--   1. Detecta esos eventos (metadata sin cliente_id)
--   2. Reconstruye la metadata completa desde las tablas actuales
--   3. Actualiza en un solo UPDATE (sin tocar eventos ya correctos)
--
-- Ejecución: npm run db:exec supabase/maintenance/backfill-traslados-historial.sql
-- =============================================================

-- ── PASO 0: Diagnóstico previo ──────────────────────────────
-- Cuántos traslados necesitan backfill
SELECT
  COUNT(*) AS traslados_sin_cliente_id,
  MIN(fecha_evento) AS primer_traslado,
  MAX(fecha_evento) AS ultimo_traslado
FROM audit_log
WHERE tabla       = 'negociaciones'
  AND accion      = 'CREATE'
  AND metadata->>'tipo' = 'TRASLADO_VIVIENDA'
  AND (metadata->>'cliente_id') IS NULL
  AND datos_nuevos->>'cliente_id' IS NOT NULL;

-- ── PASO 1: Backfill ────────────────────────────────────────
WITH

-- Eventos candidatos (traslados sin cliente_id en metadata)
traslado_events AS (
  SELECT
    al.id                                            AS audit_id,
    al.registro_id                                   AS nueva_neg_id,
    (al.datos_nuevos->>'cliente_id')                 AS cliente_id,
    (al.datos_nuevos->>'vivienda_id')                AS vivienda_destino_id,
    (al.datos_nuevos->>'negociacion_origen_id')       AS negociacion_origen_id,
    (al.datos_nuevos->>'valor_negociado')             AS valor_negociado,
    (al.datos_nuevos->>'motivo_traslado')             AS motivo,
    (al.datos_nuevos->>'autorizado_por')              AS autorizado_por
  FROM audit_log al
  WHERE al.tabla       = 'negociaciones'
    AND al.accion      = 'CREATE'
    AND al.metadata->>'tipo' = 'TRASLADO_VIVIENDA'
    AND (al.metadata->>'cliente_id') IS NULL
    AND al.datos_nuevos->>'cliente_id' IS NOT NULL
),

-- Vivienda ORIGEN: la que tenía la negociación origen
neg_origen_info AS (
  SELECT
    te.audit_id,
    n.vivienda_id                                    AS vivienda_origen_id,
    v.numero                                         AS vivienda_origen_numero,
    mz.nombre                                        AS vivienda_origen_manzana,
    p.nombre                                         AS vivienda_origen_proyecto
  FROM traslado_events te
  JOIN negociaciones   n  ON n.id  = te.negociacion_origen_id::uuid
  JOIN viviendas       v  ON v.id  = n.vivienda_id
  LEFT JOIN manzanas   mz ON mz.id = v.manzana_id
  LEFT JOIN proyectos  p  ON p.id  = mz.proyecto_id
),

-- Vivienda DESTINO: la nueva vivienda asignada
viv_destino_info AS (
  SELECT
    te.audit_id,
    v.numero                                         AS vivienda_destino_numero,
    mz.nombre                                        AS vivienda_destino_manzana,
    p.nombre                                         AS vivienda_destino_proyecto
  FROM traslado_events te
  JOIN viviendas       v  ON v.id  = te.vivienda_destino_id::uuid
  LEFT JOIN manzanas   mz ON mz.id = v.manzana_id
  LEFT JOIN proyectos  p  ON p.id  = mz.proyecto_id
),

-- Valor anterior: valor_total_pagar de la negociación ORIGEN
-- (calculado por trigger: incluye gastos notariales + recargo − descuentos)
valor_anterior_info AS (
  SELECT
    te.audit_id,
    COALESCE(n.valor_total_pagar, n.valor_negociado) AS valor_anterior
  FROM traslado_events te
  JOIN negociaciones   n  ON n.id = te.negociacion_origen_id::uuid
),

-- Fuentes de pago de la NUEVA negociación
fuentes_nueva_neg AS (
  SELECT
    te.audit_id,
    jsonb_agg(
      jsonb_build_object(
        'tipo',              fp.tipo,
        'monto_aprobado',    fp.monto_aprobado,
        'entidad',           fp.entidad,
        'numero_referencia', fp.numero_referencia
      )
      ORDER BY fp.tipo
    ) AS fuentes_json
  FROM traslado_events te
  JOIN fuentes_pago fp ON fp.negociacion_id = te.nueva_neg_id::uuid
  GROUP BY te.audit_id
),

-- Abonos trasladados: contamos los abonos activos de la nueva negociación
abonos_info AS (
  SELECT
    te.audit_id,
    COUNT(ah.id)::int                   AS abonos_trasladados,
    COALESCE(SUM(ah.monto), 0)          AS monto_abonos_trasladados
  FROM traslado_events te
  JOIN fuentes_pago    fp ON fp.negociacion_id = te.nueva_neg_id::uuid
  JOIN abonos_historial ah ON ah.fuente_pago_id = fp.id
                          AND ah.estado = 'Activo'
  GROUP BY te.audit_id
),

-- Descuento (si aplica) de la nueva negociación
descuento_info AS (
  SELECT
    te.audit_id,
    COALESCE(n.descuento_aplicado, 0)  AS descuento_aplicado,
    n.tipo_descuento,
    n.motivo_descuento
  FROM traslado_events te
  JOIN negociaciones n ON n.id = te.nueva_neg_id::uuid
)

-- ── UPDATE final ────────────────────────────────────────────
UPDATE audit_log al
SET metadata = al.metadata
  -- Campos obligatorios para que el historial del cliente lo detecte
  || jsonb_build_object('cliente_id',           te.cliente_id::uuid)
  || jsonb_build_object('negociacion_nueva_id',  al.registro_id)
  || jsonb_build_object('negociacion_origen_id', te.negociacion_origen_id::uuid)

  -- Motivo y autorización
  || jsonb_build_object('motivo',               te.motivo)
  || jsonb_build_object('autorizado_por',       te.autorizado_por)

  -- Vivienda destino
  || jsonb_build_object('vivienda_destino_id',       te.vivienda_destino_id::uuid)
  || COALESCE(
       jsonb_build_object(
         'vivienda_destino_numero',   vd.vivienda_destino_numero,
         'vivienda_destino_manzana',  vd.vivienda_destino_manzana,
         'vivienda_destino_proyecto', vd.vivienda_destino_proyecto
       ),
       '{}'::jsonb
     )

  -- Vivienda origen
  || COALESCE(
       jsonb_build_object(
         'vivienda_origen_id',       no2.vivienda_origen_id,
         'vivienda_origen_numero',   no2.vivienda_origen_numero,
         'vivienda_origen_manzana',  no2.vivienda_origen_manzana,
         'vivienda_origen_proyecto', no2.vivienda_origen_proyecto
       ),
       '{}'::jsonb
     )

  -- Valores económicos
  || jsonb_build_object('valor_nuevo', te.valor_negociado::numeric)
  || COALESCE(
       jsonb_build_object('valor_anterior', va.valor_anterior),
       '{}'::jsonb
     )

  -- Descuento
  || COALESCE(
       jsonb_build_object(
         'descuento_aplicado', di.descuento_aplicado,
         'tipo_descuento',     di.tipo_descuento,
         'motivo_descuento',   di.motivo_descuento
       ),
       '{}'::jsonb
     )

  -- Abonos trasladados
  || COALESCE(
       jsonb_build_object(
         'abonos_trasladados',        ab.abonos_trasladados,
         'monto_abonos_trasladados',  ab.monto_abonos_trasladados
       ),
       jsonb_build_object(
         'abonos_trasladados',       0,
         'monto_abonos_trasladados', 0
       )
     )

  -- Fuentes de pago de la nueva negociación
  || COALESCE(
       jsonb_build_object('fuentes_pago_destino', fn.fuentes_json),
       '{}'::jsonb
     )

  -- Marca de auditoría del backfill
  || jsonb_build_object('backfill', true)

FROM traslado_events  te
LEFT JOIN neg_origen_info    no2 ON no2.audit_id = te.audit_id
LEFT JOIN viv_destino_info   vd  ON vd.audit_id  = te.audit_id
LEFT JOIN valor_anterior_info va  ON va.audit_id  = te.audit_id
LEFT JOIN fuentes_nueva_neg  fn  ON fn.audit_id  = te.audit_id
LEFT JOIN abonos_info        ab  ON ab.audit_id  = te.audit_id
LEFT JOIN descuento_info     di  ON di.audit_id  = te.audit_id
WHERE al.id = te.audit_id;

-- ── PASO 2: Verificación post-backfill ──────────────────────
SELECT
  al.id,
  al.fecha_evento,
  al.metadata->>'cliente_id'              AS cliente_id,
  al.metadata->>'tipo'                    AS tipo,
  al.metadata->>'vivienda_origen_numero'  AS casa_origen,
  al.metadata->>'vivienda_destino_numero' AS casa_destino,
  al.metadata->>'motivo'                  AS motivo,
  al.metadata->>'valor_nuevo'             AS valor_nuevo,
  (al.metadata->>'backfill')::boolean     AS fue_backfill
FROM audit_log al
WHERE al.tabla  = 'negociaciones'
  AND al.accion = 'CREATE'
  AND al.metadata->>'tipo' = 'TRASLADO_VIVIENDA'
ORDER BY al.fecha_evento DESC
LIMIT 20;
