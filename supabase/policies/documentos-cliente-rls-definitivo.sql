-- 🔧 SOLUCIÓN DEFINITIVA: RLS Policies funcionales para documentos_cliente
--
-- El problema era que las subqueries no funcionaban correctamente
-- Solución: Usar claims del JWT directamente con auth.jwt()

-- 1. Re-habilitar RLS
ALTER TABLE documentos_cliente ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar policies antiguas
DROP POLICY IF EXISTS "admin_all_access" ON documentos_cliente;
DROP POLICY IF EXISTS "users_own_docs" ON documentos_cliente;
DROP POLICY IF EXISTS "Administradores acceso total" ON documentos_cliente;
DROP POLICY IF EXISTS "Usuarios sus propios documentos" ON documentos_cliente;

-- 3. Policy para ADMINISTRADORES (acceso total usando JWT claims)
CREATE POLICY "admin_full_access"
ON documentos_cliente
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'rol' = 'Administrador'
);

-- 4. Policy para USUARIOS NORMALES (solo sus documentos)
CREATE POLICY "users_own_documents"
ON documentos_cliente
FOR ALL
TO authenticated
USING (
  subido_por = auth.uid()
);

-- 5. Verificar policies creadas
SELECT
  policyname as "Policy Name",
  cmd as "Command",
  roles as "Roles",
  qual as "Condition"
FROM pg_policies
WHERE tablename = 'documentos_cliente'
ORDER BY policyname;
