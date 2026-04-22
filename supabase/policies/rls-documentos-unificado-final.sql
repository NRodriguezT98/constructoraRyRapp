-- ============================================================
-- LIMPIEZA DEFINITIVA RLS — las 3 tablas de documentos
-- ============================================================
--
-- PRINCIPIO: SELECT abierto para autenticados en las 3 tablas.
-- El control granular (qué botones/acciones se muestran) lo
-- maneja la aplicación con usePermisosQuery() y permisos_rol.
-- Evitar duplicidad de políticas acumuladas de sesiones anteriores.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. documentos_cliente
-- ────────────────────────────────────────────────────────────
ALTER TABLE documentos_cliente ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_access"                                     ON documentos_cliente;
DROP POLICY IF EXISTS "admin_access"                                    ON documentos_cliente;
DROP POLICY IF EXISTS "admin_full_access"                               ON documentos_cliente;
DROP POLICY IF EXISTS "users_own_documents"                             ON documentos_cliente;
DROP POLICY IF EXISTS "Administradores acceso total"                    ON documentos_cliente;
DROP POLICY IF EXISTS "Usuarios sus propios documentos"                 ON documentos_cliente;
DROP POLICY IF EXISTS "Usuarios pueden insertar documentos"             ON documentos_cliente;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus documentos"       ON documentos_cliente;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus documentos"         ON documentos_cliente;
DROP POLICY IF EXISTS "authenticated_can_view_documentos_cliente"       ON documentos_cliente;
DROP POLICY IF EXISTS "authenticated_can_insert_documentos_cliente"     ON documentos_cliente;
DROP POLICY IF EXISTS "uploader_or_admin_can_update_documentos_cliente" ON documentos_cliente;
DROP POLICY IF EXISTS "admin_can_delete_documentos_cliente"             ON documentos_cliente;

-- SELECT: Todo autenticado puede leer
CREATE POLICY "dc_select" ON documentos_cliente
FOR SELECT TO authenticated USING (true);

-- INSERT: Todo autenticado puede insertar (la app controla si muestra el botón)
CREATE POLICY "dc_insert" ON documentos_cliente
FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE: Solo quien subió el doc o admin
CREATE POLICY "dc_update" ON documentos_cliente
FOR UPDATE TO authenticated
USING (
  subido_por = auth.uid()
  OR (auth.jwt() ->> 'rol') = 'Administrador'
)
WITH CHECK (
  subido_por = auth.uid()
  OR (auth.jwt() ->> 'rol') = 'Administrador'
);

-- DELETE: Solo admins
CREATE POLICY "dc_delete" ON documentos_cliente
FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'rol') = 'Administrador');

-- ────────────────────────────────────────────────────────────
-- 2. documentos_proyecto
-- ────────────────────────────────────────────────────────────
ALTER TABLE documentos_proyecto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver documentos con permisos"              ON documentos_proyecto;
DROP POLICY IF EXISTS "Los usuarios pueden ver documentos de sus proyectos"      ON documentos_proyecto;
DROP POLICY IF EXISTS "Usuarios pueden crear documentos con permisos"            ON documentos_proyecto;
DROP POLICY IF EXISTS "Los usuarios pueden subir documentos a sus proyectos"     ON documentos_proyecto;
DROP POLICY IF EXISTS "Usuarios pueden editar documentos con permisos"           ON documentos_proyecto;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar documentos de sus proyectos" ON documentos_proyecto;
DROP POLICY IF EXISTS "Usuarios pueden eliminar documentos con permisos"         ON documentos_proyecto;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar documentos de sus proyectos" ON documentos_proyecto;
DROP POLICY IF EXISTS "Users can view documents"                                 ON documentos_proyecto;
DROP POLICY IF EXISTS "Users can create documents"                               ON documentos_proyecto;
DROP POLICY IF EXISTS "Users can update documents"                               ON documentos_proyecto;
DROP POLICY IF EXISTS "Users can delete documents"                               ON documentos_proyecto;

-- SELECT: Todo autenticado puede leer
CREATE POLICY "dp_select" ON documentos_proyecto
FOR SELECT TO authenticated USING (true);

-- INSERT: Todo autenticado puede insertar
CREATE POLICY "dp_insert" ON documentos_proyecto
FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE: Solo quien subió o admin
CREATE POLICY "dp_update" ON documentos_proyecto
FOR UPDATE TO authenticated
USING (
  subido_por = auth.uid()
  OR (auth.jwt() ->> 'rol') = 'Administrador'
)
WITH CHECK (
  subido_por = auth.uid()
  OR (auth.jwt() ->> 'rol') = 'Administrador'
);

-- DELETE: Solo admins
CREATE POLICY "dp_delete" ON documentos_proyecto
FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'rol') = 'Administrador');

-- ────────────────────────────────────────────────────────────
-- 3. documentos_vivienda (ya funciona bien, uniforme igual)
-- ────────────────────────────────────────────────────────────
ALTER TABLE documentos_vivienda ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver documentos de viviendas"    ON documentos_vivienda;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear documentos de viviendas"  ON documentos_vivienda;
DROP POLICY IF EXISTS "Solo admins pueden eliminar documentos de viviendas"         ON documentos_vivienda;

-- SELECT: Todo autenticado puede leer
CREATE POLICY "dv_select" ON documentos_vivienda
FOR SELECT TO authenticated USING (true);

-- INSERT: Todo autenticado puede insertar
CREATE POLICY "dv_insert" ON documentos_vivienda
FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE: Solo quien subió o admin
CREATE POLICY "dv_update" ON documentos_vivienda
FOR UPDATE TO authenticated
USING (
  subido_por = auth.uid()
  OR (auth.jwt() ->> 'rol') = 'Administrador'
)
WITH CHECK (
  subido_por = auth.uid()
  OR (auth.jwt() ->> 'rol') = 'Administrador'
);

-- DELETE: Solo admins
CREATE POLICY "dv_delete" ON documentos_vivienda
FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'rol') = 'Administrador');

-- ────────────────────────────────────────────────────────────
-- Verificación final
-- ────────────────────────────────────────────────────────────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('documentos_cliente','documentos_vivienda','documentos_proyecto')
ORDER BY tablename, cmd;
