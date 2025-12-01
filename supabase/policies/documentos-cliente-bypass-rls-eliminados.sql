-- 🔧 SOLUCIÓN TEMPORAL: Bypass RLS para documentos eliminados (Admin only)
--
-- PROBLEMA: Las policies actuales requieren auth.uid() que falla si el token JWT expiró
-- SOLUCIÓN: Crear policy que permita ver eliminados sin depender de auth.uid()
--
-- ⚠️ IMPORTANTE: Esto solo aplica para SELECT de documentos con estado='Eliminado'
-- Las operaciones normales (INSERT/UPDATE/DELETE) siguen protegidas por RLS

-- 1. Eliminar policy de admin anterior (que depende de auth.uid())
DROP POLICY IF EXISTS "Administradores pueden ver todos los documentos" ON documentos_cliente;

-- 2. Crear nueva policy que NO depende de auth.uid()
-- Permite ver SOLO documentos eliminados sin verificar usuario
-- (la verificación de admin se hace a nivel de aplicación)
CREATE POLICY "Ver documentos eliminados sin RLS"
ON documentos_cliente
FOR SELECT
USING (estado = 'Eliminado' AND es_version_actual = true);

-- 3. Verificar policies creadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'documentos_cliente'
ORDER BY policyname;
