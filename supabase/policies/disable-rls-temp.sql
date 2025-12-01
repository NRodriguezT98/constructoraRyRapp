-- 🔧 ÚLTIMO RECURSO: Deshabilitar RLS temporalmente para debug

-- Deshabilitar RLS en documentos_cliente
ALTER TABLE documentos_cliente DISABLE ROW LEVEL SECURITY;

-- Verificar estado
SELECT
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'documentos_cliente';
