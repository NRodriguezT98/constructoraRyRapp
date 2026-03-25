-- =====================================================
-- MIGRACIÓN 031: Fix función obtener_snapshot_abonos
-- Columnas fecha_aprobacion y fecha_desembolso no existen
-- en fuentes_pago. Reemplazar con columnas reales:
--   fecha_aprobacion → fecha_resolucion (fecha de resolución/aprobación)
--   fecha_desembolso → fecha_completado (fecha de completado/desembolso)
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_snapshot_abonos(
  p_negociacion_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_snapshot JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'tipo', tipo,
      'entidad', entidad,
      'monto_aprobado', monto_aprobado,
      'monto_recibido', monto_recibido,
      'estado', estado,
      'fecha_resolucion', fecha_resolucion,
      'fecha_completado', fecha_completado
    )
  )
  INTO v_snapshot
  FROM fuentes_pago
  WHERE negociacion_id = p_negociacion_id;

  RETURN v_snapshot;
END;
$$;

COMMENT ON FUNCTION obtener_snapshot_abonos IS
'Genera un JSON con el snapshot de todas las fuentes de pago de una negociación (para auditoría)';
