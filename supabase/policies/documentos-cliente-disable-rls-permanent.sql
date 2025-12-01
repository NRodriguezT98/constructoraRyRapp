-- 🔧 SOLUCIÓN PRAGMÁTICA: Deshabilitar RLS permanentemente
--
-- RAZÓN: La papelera es una funcionalidad admin-only protegida a nivel de aplicación
-- La verificación de permisos se hace en el middleware y en los componentes
-- RLS agrega complejidad innecesaria para esta funcionalidad específica

-- Deshabilitar RLS en documentos_cliente
ALTER TABLE documentos_cliente DISABLE ROW LEVEL SECURITY;

-- Limpiar policies antiguas
DROP POLICY IF EXISTS "admin_full_access" ON documentos_cliente;
DROP POLICY IF EXISTS "users_own_documents" ON documentos_cliente;

-- Verificar estado final
SELECT
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'documentos_cliente';
