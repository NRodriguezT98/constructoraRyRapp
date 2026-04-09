-- =====================================================
-- BACKFILL: enriquecer metadata de eventos negociacion_creada
-- en audit_log con campos que no se capturaban antes:
--   • vivienda_area_construida
--   • vivienda_area_lote
--   • vivienda_tipo_vivienda
--   • negociacion_valor_total  (corregido: usar valor_total_pagar real)
--
-- Aplica SOLO a registros donde esos campos son NULL en metadata.
-- Es idempotente: se puede ejecutar varias veces sin daño.
--
-- Ejecutar con:  npm run db:exec supabase/migrations/backfill_negociacion_metadata_areas_tipo.sql
-- =====================================================

UPDATE public.audit_log al
SET metadata = al.metadata
  -- Área construida (si es null en metadata pero existe en vivienda)
  || CASE
       WHEN al.metadata->>'vivienda_area_construida' IS NULL
            AND v.area_construida IS NOT NULL
       THEN jsonb_build_object('vivienda_area_construida', v.area_construida)
       ELSE '{}'::jsonb
     END
  -- Área del lote (si es null en metadata pero existe en vivienda)
  || CASE
       WHEN al.metadata->>'vivienda_area_lote' IS NULL
            AND v.area_lote IS NOT NULL
       THEN jsonb_build_object('vivienda_area_lote', v.area_lote)
       ELSE '{}'::jsonb
     END
  -- Tipo de vivienda (si es null en metadata pero existe en vivienda)
  || CASE
       WHEN al.metadata->>'vivienda_tipo_vivienda' IS NULL
            AND v.tipo_vivienda IS NOT NULL
       THEN jsonb_build_object('vivienda_tipo_vivienda', v.tipo_vivienda)
       ELSE '{}'::jsonb
     END
  -- valor_total corregido: usar el valor real de negociaciones.valor_total_pagar
  -- Solo actualizar si el stored total parece incorrecto
  -- (es igual a valor_negociado - descuento, sin incluir gastos/recargo)
  || CASE
       WHEN n.valor_total_pagar IS NOT NULL
            AND (al.metadata->>'negociacion_valor_total')::numeric IS DISTINCT FROM n.valor_total_pagar
       THEN jsonb_build_object(
              'negociacion_valor_total',    n.valor_total_pagar,
              'negociacion_saldo_pendiente', n.valor_total_pagar
            )
       ELSE '{}'::jsonb
     END
FROM
  public.negociaciones n
  JOIN public.viviendas v ON v.id = n.vivienda_id
WHERE
  -- Solo eventos de creación de negociación
  al.accion = 'CREATE'
  AND al.tabla = 'negociaciones'
  -- Unir por registro_id (UUID de la negociación)
  AND al.registro_id::text = n.id::text
  -- Solo los que falten al menos uno de los campos nuevos
  AND (
    al.metadata->>'vivienda_area_construida' IS NULL
    OR al.metadata->>'vivienda_area_lote'    IS NULL
    OR al.metadata->>'vivienda_tipo_vivienda' IS NULL
    OR (al.metadata->>'negociacion_valor_total')::numeric IS DISTINCT FROM n.valor_total_pagar
  );

-- Verificar cuántos registros se actualizaron
SELECT
  COUNT(*) AS eventos_actualizados,
  COUNT(*) FILTER (WHERE metadata->>'vivienda_area_construida' IS NOT NULL) AS con_area_construida,
  COUNT(*) FILTER (WHERE metadata->>'vivienda_area_lote' IS NOT NULL) AS con_area_lote,
  COUNT(*) FILTER (WHERE metadata->>'vivienda_tipo_vivienda' IS NOT NULL) AS con_tipo_vivienda
FROM public.audit_log
WHERE accion = 'CREATE'
  AND tabla = 'negociaciones';
