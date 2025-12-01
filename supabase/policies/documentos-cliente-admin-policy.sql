-- =====================================================
-- POLÍTICAS RLS: Administradores pueden ver papelera
-- =====================================================

-- 1. Crear política para que administradores vean TODOS los documentos
CREATE POLICY "Administradores pueden ver todos los documentos"
ON documentos_cliente FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
);

-- 2. Verificar políticas actuales
SELECT
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'documentos_cliente'
ORDER BY policyname;
