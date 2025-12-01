-- ============================================
-- RLS POLICIES PARA DOCUMENTOS_CLIENTE
-- ============================================
-- Basado en el patrón de documentos_proyecto (que funciona)

-- 1. DROP políticas existentes si existen
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver documentos de clientes" ON documentos_cliente;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden insertar documentos de clientes" ON documentos_cliente;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden actualizar documentos de clientes" ON documentos_cliente;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden eliminar documentos de clientes" ON documentos_cliente;

-- 2. CREAR políticas permisivas (authenticated users tienen acceso total)
CREATE POLICY "Los usuarios autenticados pueden ver documentos de clientes"
ON documentos_cliente
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Los usuarios autenticados pueden insertar documentos de clientes"
ON documentos_cliente
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Los usuarios autenticados pueden actualizar documentos de clientes"
ON documentos_cliente
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Los usuarios autenticados pueden eliminar documentos de clientes"
ON documentos_cliente
FOR DELETE
TO authenticated
USING (true);

-- 3. VERIFICAR que se crearon correctamente
SELECT
    policyname,
    cmd as operacion,
    CASE WHEN qual IS NULL THEN 'Sin restricción' ELSE 'Con restricción' END as acceso
FROM pg_policies
WHERE tablename = 'documentos_cliente'
ORDER BY policyname;
