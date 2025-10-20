-- ============================================
-- POLÍTICAS RLS PARA DOCUMENTOS Y CATEGORÍAS
-- ============================================

-- ============================================
-- 1. TABLA: categorias_documento
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own categories" ON categorias_documento;
DROP POLICY IF EXISTS "Users can create their own categories" ON categorias_documento;
DROP POLICY IF EXISTS "Users can update their own categories" ON categorias_documento;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categorias_documento;

-- Habilitar RLS
ALTER TABLE categorias_documento ENABLE ROW LEVEL SECURITY;

-- Permitir ver sus propias categorías
CREATE POLICY "Users can view their own categories"
ON categorias_documento
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Permitir crear categorías
CREATE POLICY "Users can create their own categories"
ON categorias_documento
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Permitir actualizar sus categorías
CREATE POLICY "Users can update their own categories"
ON categorias_documento
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Permitir eliminar sus categorías
CREATE POLICY "Users can delete their own categories"
ON categorias_documento
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 2. TABLA: documentos_proyecto
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view documents" ON documentos_proyecto;
DROP POLICY IF EXISTS "Users can create documents" ON documentos_proyecto;
DROP POLICY IF EXISTS "Users can update documents" ON documentos_proyecto;
DROP POLICY IF EXISTS "Users can delete documents" ON documentos_proyecto;

-- Habilitar RLS
ALTER TABLE documentos_proyecto ENABLE ROW LEVEL SECURITY;

-- Permitir ver documentos (basado en user_id del documento)
CREATE POLICY "Users can view documents"
ON documentos_proyecto
FOR SELECT
TO authenticated
USING (
  -- El usuario puede ver documentos que él subió
  user_id = auth.uid()
  OR
  -- O documentos de proyectos donde es miembro (implementar después)
  true -- Por ahora permitir ver todos si está autenticado
);

-- Permitir crear documentos
CREATE POLICY "Users can create documents"
ON documentos_proyecto
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Permitir actualizar documentos propios
CREATE POLICY "Users can update documents"
ON documentos_proyecto
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Permitir eliminar documentos propios
CREATE POLICY "Users can delete documents"
ON documentos_proyecto
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver políticas de categorias_documento
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'categorias_documento';

-- Ver políticas de documentos_proyecto
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'documentos_proyecto';
