-- =====================================================
-- ⚠️ EJECUTAR ESTE SQL AHORA EN SUPABASE ⚠️
-- =====================================================
-- Dashboard → SQL Editor → New Query → Pegar → Run
-- =====================================================

-- 1️⃣ LIMPIAR POLÍTICAS VIEJAS (si existen)
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver negociaciones" ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear negociaciones" ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar negociaciones" ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar negociaciones" ON negociaciones;

-- 2️⃣ HABILITAR RLS
ALTER TABLE negociaciones ENABLE ROW LEVEL SECURITY;

-- 3️⃣ CREAR POLÍTICAS NUEVAS (PERMISIVAS)
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

-- 4️⃣ VERIFICAR (deberías ver 4 políticas)
SELECT
  policyname as "Política",
  cmd as "Comando",
  permissive as "Permisiva"
FROM pg_policies
WHERE tablename = 'negociaciones'
ORDER BY policyname;

-- =====================================================
-- ✅ SI TODO ESTÁ BIEN, VERÁS:
-- =====================================================
-- Usuarios autenticados pueden crear negociaciones | INSERT | PERMISSIVE
-- Usuarios autenticados pueden actualizar negociaciones | UPDATE | PERMISSIVE
-- Usuarios autenticados pueden eliminar negociaciones | DELETE | PERMISSIVE
-- Usuarios autenticados pueden ver negociaciones | SELECT | PERMISSIVE
-- =====================================================
