-- ============================================
-- SOLUCIÓN TEMPORAL: Deshabilitar RLS para desarrollo
-- ============================================
-- ⚠️ SOLO PARA DESARROLLO - No usar en producción

-- Deshabilitar RLS en tablas necesarias para vista de abonos
ALTER TABLE negociaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE viviendas DISABLE ROW LEVEL SECURITY;
ALTER TABLE manzanas DISABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos DISABLE ROW LEVEL SECURITY;
ALTER TABLE fuentes_pago DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('negociaciones', 'clientes', 'viviendas', 'manzanas', 'proyectos', 'fuentes_pago')
ORDER BY tablename;

-- ============================================
-- ALTERNATIVA: Crear políticas SELECT públicas
-- ============================================
-- Esta es la solución CORRECTA para producción

-- Política para negociaciones
DROP POLICY IF EXISTS "allow_select_negociaciones" ON negociaciones;
CREATE POLICY "allow_select_negociaciones"
ON negociaciones FOR SELECT
USING (true);

-- Política para clientes
DROP POLICY IF EXISTS "allow_select_clientes" ON clientes;
CREATE POLICY "allow_select_clientes"
ON clientes FOR SELECT
USING (true);

-- Política para viviendas
DROP POLICY IF EXISTS "allow_select_viviendas" ON viviendas;
CREATE POLICY "allow_select_viviendas"
ON viviendas FOR SELECT
USING (true);

-- Política para manzanas
DROP POLICY IF EXISTS "allow_select_manzanas" ON manzanas;
CREATE POLICY "allow_select_manzanas"
ON manzanas FOR SELECT
USING (true);

-- Política para proyectos
DROP POLICY IF EXISTS "allow_select_proyectos" ON proyectos;
CREATE POLICY "allow_select_proyectos"
ON proyectos FOR SELECT
USING (true);

-- Política para fuentes_pago
DROP POLICY IF EXISTS "allow_select_fuentes_pago" ON fuentes_pago;
CREATE POLICY "allow_select_fuentes_pago"
ON fuentes_pago FOR SELECT
USING (true);

-- Verificar políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('negociaciones', 'clientes', 'viviendas', 'manzanas', 'proyectos', 'fuentes_pago')
ORDER BY tablename, policyname;
