-- =====================================================
-- FIX: Verificar y Aplicar RLS para Negociaciones
-- =====================================================

-- 1. Verificar si RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'negociaciones';

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE negociaciones ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes (por si hay conflicto)
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver negociaciones" ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear negociaciones" ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar negociaciones" ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar negociaciones" ON negociaciones;

-- 4. Crear políticas nuevas
CREATE POLICY "Usuarios autenticados pueden ver negociaciones"
  ON negociaciones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear negociaciones"
  ON negociaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar negociaciones"
  ON negociaciones
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar negociaciones"
  ON negociaciones
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. Verificar que las políticas se crearon
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'negociaciones'
ORDER BY policyname;

-- =====================================================
-- MENSAJE
-- =====================================================
-- Ejecuta este script en el SQL Editor de Supabase
-- Dashboard → SQL Editor → New query → Pega este código → Run
-- =====================================================
