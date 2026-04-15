-- ─────────────────────────────────────────────────────────────
-- Migración 025: Política RLS para edición de abonos (admin)
-- ─────────────────────────────────────────────────────────────
-- La política existente "abonos_update_anular_admin" solo permite
-- UPDATE cuando el nuevo estado es 'Anulado'.
-- Esta nueva política permite editar campos de un abono activo
-- (monto, fecha, método, etc.) manteniendo estado = 'Activo'.
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "abonos_update_editar_admin" ON abonos_historial;

CREATE POLICY "abonos_update_editar_admin"
  ON abonos_historial
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_rol') = 'Administrador'
    AND estado = 'Activo'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_rol') = 'Administrador'
    AND estado = 'Activo'
  );

-- ─────────────────────────────────────────────────────────────
-- Fin de migración 025
-- ─────────────────────────────────────────────────────────────
