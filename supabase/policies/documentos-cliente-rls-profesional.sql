-- 🔧 SOLUCIÓN PROFESIONAL: RLS con función PostgreSQL para verificar rol admin
--
-- En lugar de confiar en JWT claims (que pueden no estar sincronizados),
-- creamos una función que verifica directamente en la tabla usuarios

-- 1. Crear función para verificar si usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM usuarios
    WHERE id = auth.uid()
    AND rol = 'Administrador'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-habilitar RLS
ALTER TABLE documentos_cliente ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar policies antiguas
DROP POLICY IF EXISTS "admin_full_access" ON documentos_cliente;
DROP POLICY IF EXISTS "users_own_documents" ON documentos_cliente;

-- 4. Policy para ADMINISTRADORES (usando función)
CREATE POLICY "admin_access"
ON documentos_cliente
FOR ALL
TO authenticated
USING (is_admin());

-- 5. Policy para USUARIOS NORMALES (sus documentos)
CREATE POLICY "user_access"
ON documentos_cliente
FOR ALL
TO authenticated
USING (subido_por = auth.uid());

-- 6. Verificar configuración
SELECT
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'documentos_cliente';

SELECT
  policyname as "Policy",
  cmd as "Command"
FROM pg_policies
WHERE tablename = 'documentos_cliente'
ORDER BY policyname;
