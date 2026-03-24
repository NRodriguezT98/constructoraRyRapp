-- ================================================================
-- 023e: Fix RLS - Agregar política INSERT faltante en abonos_historial
-- ================================================================
-- La migración 023 habilitó RLS y solo creó SELECT + UPDATE,
-- omitiendo INSERT, lo que bloquea el registro de nuevos abonos.
-- ================================================================

-- INSERT: cualquier usuario autenticado puede registrar abonos
CREATE POLICY "abonos_insert_authenticated"
  ON abonos_historial
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- DELETE: solo admin puede eliminar (si se necesita en el futuro)
CREATE POLICY "abonos_delete_admin"
  ON abonos_historial
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_rol') = 'Administrador'
  );
