-- =====================================================
-- Limpiar políticas RLS duplicadas en configuracion_recargos
-- =====================================================

-- 1. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Solo administradores pueden actualizar configuracion_recargos" ON configuracion_recargos;
DROP POLICY IF EXISTS "Solo administradores pueden crear configuracion_recargos" ON configuracion_recargos;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar configuracion_recargos" ON configuracion_recargos;
DROP POLICY IF EXISTS "Solo administradores pueden modificar recargos" ON configuracion_recargos;
DROP POLICY IF EXISTS "Todos pueden ver configuración de recargos" ON configuracion_recargos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer configuracion_recargos" ON configuracion_recargos;

-- 2. Crear políticas limpias y correctas

-- SELECT: Todos los usuarios autenticados pueden leer
CREATE POLICY "Usuarios autenticados pueden leer configuracion_recargos"
ON configuracion_recargos
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Solo administradores pueden crear
CREATE POLICY "Solo administradores pueden crear configuracion_recargos"
ON configuracion_recargos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
);

-- UPDATE: Solo administradores pueden actualizar
CREATE POLICY "Solo administradores pueden actualizar configuracion_recargos"
ON configuracion_recargos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
);

-- DELETE: Solo administradores pueden eliminar
CREATE POLICY "Solo administradores pueden eliminar configuracion_recargos"
ON configuracion_recargos
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
);

-- =====================================================
-- Verificación
-- =====================================================
-- Ejecutar para verificar que solo hay 4 políticas:
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'configuracion_recargos'
ORDER BY policyname;

-- Resultado esperado (4 políticas):
-- | Solo administradores pueden actualizar configuracion_recargos | UPDATE |
-- | Solo administradores pueden crear configuracion_recargos      | INSERT |
-- | Solo administradores pueden eliminar configuracion_recargos   | DELETE |
-- | Usuarios autenticados pueden leer configuracion_recargos      | SELECT |
