-- ============================================================
-- FIX: RLS documentos_cliente — SELECT abierto para autenticados
-- ============================================================
--
-- PROBLEMA: La policy "users_own_documents" restringía SELECT a
-- solo los documentos subidos por el propio usuario, impidiendo
-- que roles como "Contabilidad" vean documentos subidos por otros.
--
-- SOLUCIÓN: Mismo patrón que documentos_proyecto — SELECT abierto
-- para cualquier usuario autenticado. El control de acceso a nivel
-- de módulo (qué botones se muestran, qué acciones se permiten) lo
-- maneja la aplicación con usePermisosQuery().
--
-- SELECT: Todos los autenticados pueden leer (ver la lista)
-- INSERT: Solo quienes tienen permiso crear en la aplicación
-- UPDATE: Solo el que subió o admin
-- DELETE: Solo admin
-- ============================================================

-- 1. Eliminar policies anteriores conflictivas
DROP POLICY IF EXISTS "admin_full_access" ON documentos_cliente;
DROP POLICY IF EXISTS "users_own_documents" ON documentos_cliente;
DROP POLICY IF EXISTS "Administradores acceso total" ON documentos_cliente;
DROP POLICY IF EXISTS "Usuarios sus propios documentos" ON documentos_cliente;

-- 2. Asegurar RLS habilitado
ALTER TABLE documentos_cliente ENABLE ROW LEVEL SECURITY;

-- 3. SELECT: Cualquier usuario autenticado puede leer documentos de clientes
--    (misma lógica que documentos_proyecto que usa `true`)
CREATE POLICY "authenticated_can_view_documentos_cliente"
ON documentos_cliente
FOR SELECT
TO authenticated
USING (true);

-- 4. INSERT: Cualquier usuario autenticado puede subir documentos
--    (la restricción de permisos se hace a nivel de aplicación)
CREATE POLICY "authenticated_can_insert_documentos_cliente"
ON documentos_cliente
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. UPDATE: Solo el que subió el documento o administradores
CREATE POLICY "uploader_or_admin_can_update_documentos_cliente"
ON documentos_cliente
FOR UPDATE
TO authenticated
USING (
  subido_por = auth.uid()
  OR auth.jwt() ->> 'rol' = 'Administrador'
)
WITH CHECK (
  subido_por = auth.uid()
  OR auth.jwt() ->> 'rol' = 'Administrador'
);

-- 6. DELETE: Solo administradores
CREATE POLICY "admin_can_delete_documentos_cliente"
ON documentos_cliente
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'rol' = 'Administrador'
);

-- 7. Verificar estado final
SELECT
  policyname AS "Policy",
  cmd        AS "Operación",
  qual       AS "Condición USING"
FROM pg_policies
WHERE tablename = 'documentos_cliente'
ORDER BY cmd, policyname;
