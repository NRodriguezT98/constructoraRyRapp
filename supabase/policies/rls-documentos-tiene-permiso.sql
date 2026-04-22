-- ============================================================
-- RLS CORRECTO: Usar tiene_permiso() para respetar permisos_rol
-- ============================================================
-- SELECT usa tiene_permiso(uid, 'documentos', 'ver'):
--   → Si el admin desactiva 'ver' en permisos_rol para un rol,
--     ese rol NO puede leer los documentos desde la BD.
--   → Administrador siempre tiene acceso (bypass en tiene_permiso).
-- ============================================================

-- ─── documentos_cliente ─────────────────────────────────────
ALTER TABLE documentos_cliente ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dc_select" ON documentos_cliente;
DROP POLICY IF EXISTS "dc_insert" ON documentos_cliente;
DROP POLICY IF EXISTS "dc_update" ON documentos_cliente;
DROP POLICY IF EXISTS "dc_delete" ON documentos_cliente;

CREATE POLICY "dc_select" ON documentos_cliente
FOR SELECT TO authenticated
USING (tiene_permiso(auth.uid(), 'documentos', 'ver'));

CREATE POLICY "dc_insert" ON documentos_cliente
FOR INSERT TO authenticated
WITH CHECK (tiene_permiso(auth.uid(), 'documentos', 'subir'));

CREATE POLICY "dc_update" ON documentos_cliente
FOR UPDATE TO authenticated
USING (tiene_permiso(auth.uid(), 'documentos', 'editar'))
WITH CHECK (tiene_permiso(auth.uid(), 'documentos', 'editar'));

CREATE POLICY "dc_delete" ON documentos_cliente
FOR DELETE TO authenticated
USING (tiene_permiso(auth.uid(), 'documentos', 'eliminar'));

-- ─── documentos_proyecto ────────────────────────────────────
ALTER TABLE documentos_proyecto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dp_select" ON documentos_proyecto;
DROP POLICY IF EXISTS "dp_insert" ON documentos_proyecto;
DROP POLICY IF EXISTS "dp_update" ON documentos_proyecto;
DROP POLICY IF EXISTS "dp_delete" ON documentos_proyecto;

CREATE POLICY "dp_select" ON documentos_proyecto
FOR SELECT TO authenticated
USING (tiene_permiso(auth.uid(), 'documentos', 'ver'));

CREATE POLICY "dp_insert" ON documentos_proyecto
FOR INSERT TO authenticated
WITH CHECK (tiene_permiso(auth.uid(), 'documentos', 'subir'));

CREATE POLICY "dp_update" ON documentos_proyecto
FOR UPDATE TO authenticated
USING (tiene_permiso(auth.uid(), 'documentos', 'editar'))
WITH CHECK (tiene_permiso(auth.uid(), 'documentos', 'editar'));

CREATE POLICY "dp_delete" ON documentos_proyecto
FOR DELETE TO authenticated
USING (tiene_permiso(auth.uid(), 'documentos', 'eliminar'));

-- ─── documentos_vivienda ────────────────────────────────────
ALTER TABLE documentos_vivienda ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dv_select" ON documentos_vivienda;
DROP POLICY IF EXISTS "dv_insert" ON documentos_vivienda;
DROP POLICY IF EXISTS "dv_update" ON documentos_vivienda;
DROP POLICY IF EXISTS "dv_delete" ON documentos_vivienda;

CREATE POLICY "dv_select" ON documentos_vivienda
FOR SELECT TO authenticated
USING (tiene_permiso(auth.uid(), 'documentos', 'ver'));

CREATE POLICY "dv_insert" ON documentos_vivienda
FOR INSERT TO authenticated
WITH CHECK (tiene_permiso(auth.uid(), 'documentos', 'subir'));

CREATE POLICY "dv_update" ON documentos_vivienda
FOR UPDATE TO authenticated
USING (tiene_permiso(auth.uid(), 'documentos', 'editar'))
WITH CHECK (tiene_permiso(auth.uid(), 'documentos', 'editar'));

CREATE POLICY "dv_delete" ON documentos_vivienda
FOR DELETE TO authenticated
USING (tiene_permiso(auth.uid(), 'documentos', 'eliminar'));

-- ─── Verificación final ─────────────────────────────────────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('documentos_cliente','documentos_vivienda','documentos_proyecto')
ORDER BY tablename, cmd;
