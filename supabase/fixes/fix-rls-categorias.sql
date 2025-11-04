-- =====================================================
-- FIX TEMPORAL: Deshabilitar RLS para categorias_documento
-- =====================================================
-- Ejecutar SOLO si los logs muestran que auth.uid() es undefined
-- o si auth.uid() no coincide con user_id

-- OPCIÓN 1: Deshabilitar RLS temporalmente (SOLO PARA DEBUG)
-- ⚠️ NO USAR EN PRODUCCIÓN
-- ALTER TABLE categorias_documento DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Hacer las categorías visibles para usuarios autenticados
-- Más seguro que deshabilitar RLS completamente
DROP POLICY IF EXISTS "Users can view own categories" ON categorias_documento;
CREATE POLICY "Users can view own categories"
  ON categorias_documento FOR SELECT
  USING (
    auth.uid() = user_id
    OR es_global = true
    OR auth.role() = 'authenticated' -- ⚠️ Permite ver todas si estás autenticado (temporal)
  );

-- OPCIÓN 3: Hacer que las categorías predefinidas sean globales
-- (Esto es lo correcto según el diseño original)
UPDATE categorias_documento
SET es_global = true
WHERE nombre IN ('Evidencias', 'Documentos Legales', 'Identidad', 'Financiero', 'Cartas de Aprobación');

-- Verificar
SELECT id, user_id, nombre, es_global, modulos_permitidos FROM categorias_documento;
