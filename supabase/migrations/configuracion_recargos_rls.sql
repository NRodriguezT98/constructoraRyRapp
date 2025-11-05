-- =====================================================
-- Políticas RLS para tabla configuracion_recargos
-- =====================================================

-- Habilitar RLS en la tabla
ALTER TABLE configuracion_recargos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICA 1: SELECT (Lectura)
-- Todos los usuarios autenticados pueden leer
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden leer configuracion_recargos"
ON configuracion_recargos
FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- POLÍTICA 2: INSERT (Crear)
-- Solo administradores pueden crear
-- =====================================================
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

-- =====================================================
-- POLÍTICA 3: UPDATE (Actualizar)
-- Solo administradores pueden actualizar
-- =====================================================
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

-- =====================================================
-- POLÍTICA 4: DELETE (Eliminar)
-- Solo administradores pueden eliminar
-- =====================================================
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
-- Verificación de políticas
-- =====================================================
-- Ejecutar esta query para verificar que las políticas se crearon correctamente:
/*
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'configuracion_recargos'
ORDER BY policyname;
*/
