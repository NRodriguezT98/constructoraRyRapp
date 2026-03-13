-- =====================================================
-- FUNCIÓN RPC: Inactivar fuentes sin trigger
-- =====================================================
-- Fecha: 2025-12-03
-- Solución: Bypass de triggers problemáticos
-- =====================================================

CREATE OR REPLACE FUNCTION inactivar_fuentes_pago_batch(
  p_fuente_ids UUID[],
  p_razon TEXT DEFAULT 'Fuente eliminada/reemplazada por el usuario durante edición'
)
RETURNS JSON AS $$
DECLARE
  v_affected_count INT;
  v_result JSON;
  v_fuente RECORD;
BEGIN
  -- Eliminar trigger problemático antes de actualizar
  DROP TRIGGER IF EXISTS trigger_inactivar_fuente_pago ON fuentes_pago;

  -- Actualizar fuentes en batch
  UPDATE fuentes_pago
  SET
    estado_fuente = 'inactiva',
    razon_inactivacion = p_razon,
    fecha_inactivacion = NOW()
  WHERE id = ANY(p_fuente_ids)
    AND estado_fuente = 'activa';

  GET DIAGNOSTICS v_affected_count = ROW_COUNT;

  -- Registrar manualmente en audit_log
  FOR v_fuente IN
    SELECT id, tipo, monto_aprobado
    FROM fuentes_pago
    WHERE id = ANY(p_fuente_ids)
  LOOP
    INSERT INTO audit_log (
      tabla,
      accion,
      registro_id,
      metadata,
      usuario_id,
      usuario_email
    ) VALUES (
      'fuentes_pago',
      'UPDATE',
      v_fuente.id,
      jsonb_build_object(
        'razon', p_razon,
        'tipo', v_fuente.tipo,
        'monto_aprobado', v_fuente.monto_aprobado,
        'estado_anterior', 'activa',
        'estado_nuevo', 'inactiva',
        'batch_operation', true
      ),
      auth.uid(),
      COALESCE(auth.email(), 'sistema@ryrconstrucciones.com')
    );
  END LOOP;

  v_result := json_build_object(
    'success', true,
    'affected_count', v_affected_count,
    'fuente_ids', p_fuente_ids
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos
GRANT EXECUTE ON FUNCTION inactivar_fuentes_pago_batch TO authenticated;

-- Validación
DO $$
BEGIN
  RAISE NOTICE '✅ Función RPC creada: inactivar_fuentes_pago_batch';
  RAISE NOTICE '   - Bypasea triggers problemáticos';
  RAISE NOTICE '   - Registra auditoría manualmente';
END $$;
