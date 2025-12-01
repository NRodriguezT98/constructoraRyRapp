-- 🔧 ARREGLO DEFINITIVO: RLS Policies para documentos_cliente
--
-- PROBLEMA: Las policies básicas (auth.uid() = subido_por) bloquean a admins
-- SOLUCIÓN: Eliminar policies restrictivas y crear policy admin correcta

-- 1. Eliminar TODAS las policies existentes
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios documentos" ON documentos_cliente;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios documentos" ON documentos_cliente;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios documentos" ON documentos_cliente;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios documentos" ON documentos_cliente;
DROP POLICY IF EXISTS "Administradores pueden ver todos los documentos" ON documentos_cliente;
DROP POLICY IF EXISTS "Ver documentos eliminados sin RLS" ON documentos_cliente;

-- 2. Crear policy para ADMINISTRADORES (ver todo)
CREATE POLICY "Administradores acceso total"
ON documentos_cliente
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
);

-- 3. Crear policy para USUARIOS NORMALES (solo sus documentos)
CREATE POLICY "Usuarios sus propios documentos"
ON documentos_cliente
FOR ALL
USING (auth.uid() = subido_por);

-- 4. Verificar policies creadas
SELECT
  policyname as "Policy",
  cmd as "Comando",
  qual as "Condición"
FROM pg_policies
WHERE tablename = 'documentos_cliente'
ORDER BY policyname;
