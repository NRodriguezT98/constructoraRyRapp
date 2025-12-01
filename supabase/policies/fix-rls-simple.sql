-- 🔧 FIX FINAL: Policy super simple para admins

-- Eliminar todas las policies
DROP POLICY IF EXISTS "Administradores acceso total" ON documentos_cliente;
DROP POLICY IF EXISTS "Usuarios sus propios documentos" ON documentos_cliente;

-- Policy simple: Admins ven TODO
CREATE POLICY "admin_all_access"
ON documentos_cliente
FOR SELECT
TO authenticated
USING (
  (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'Administrador'
);

-- Policy simple: Usuarios ven lo suyo
CREATE POLICY "users_own_docs"
ON documentos_cliente
FOR SELECT
TO authenticated
USING (subido_por = auth.uid());

-- Verificar
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'documentos_cliente';
