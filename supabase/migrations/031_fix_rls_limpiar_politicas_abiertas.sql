-- ============================================
-- MIGRACIÓN 031: Limpiar RLS conflictivas (viviendas, proyectos, manzanas)
-- ============================================
-- Descripción: Elimina TODAS las políticas permisivas abiertas (USING(true))
--   y las políticas owner-based antiguas (user_id = auth.uid())
--   que anulan las políticas basadas en tiene_permiso().
--
-- PROBLEMA: En PostgreSQL, las políticas PERMISSIVE se unen con OR.
--   Una política USING(true) hace que CUALQUIER usuario pase,
--   independientemente de las demás políticas.
--
-- SOLUCIÓN: Eliminar todas las políticas abiertas/legacy, dejando
--   SOLO las basadas en tiene_permiso() de la migración 022.
-- ============================================

BEGIN;

-- ============================================
-- 1. VIVIENDAS: Eliminar política abierta USING(true)
-- ============================================

-- Política de schema.sql (FOR ALL USING(true))
DROP POLICY IF EXISTS "Permitir acceso completo a viviendas" ON viviendas;

-- Política de fix-rls-abonos.sql (FOR SELECT USING(true))
DROP POLICY IF EXISTS "allow_select_viviendas" ON viviendas;

-- ============================================
-- 2. PROYECTOS: Eliminar políticas owner-based y abierta
-- ============================================

-- Políticas antiguas de schema.sql (user_id = auth.uid())
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios proyectos" ON proyectos;
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propios proyectos" ON proyectos;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios proyectos" ON proyectos;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propios proyectos" ON proyectos;

-- Política abierta de fix-rls-abonos.sql
DROP POLICY IF EXISTS "allow_select_proyectos" ON proyectos;

-- ============================================
-- 3. MANZANAS: Eliminar políticas owner-based y abierta
-- ============================================

-- Políticas antiguas de schema.sql (a través de proyecto.user_id)
DROP POLICY IF EXISTS "Los usuarios pueden ver manzanas de sus proyectos" ON manzanas;
DROP POLICY IF EXISTS "Los usuarios pueden crear manzanas en sus proyectos" ON manzanas;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar manzanas de sus proyectos" ON manzanas;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar manzanas de sus proyectos" ON manzanas;

-- Política abierta de fix-rls-abonos.sql
DROP POLICY IF EXISTS "allow_select_manzanas" ON manzanas;

-- ============================================
-- 4. CLIENTES: Eliminar política abierta
-- ============================================

DROP POLICY IF EXISTS "Permitir acceso completo a clientes" ON clientes;

-- ============================================
-- 5. RE-CREAR políticas basadas en permisos (idempotente)
--    Esto garantiza que existan incluso si 022 no se ejecutó
-- ============================================

-- --- VIVIENDAS ---
DROP POLICY IF EXISTS "Usuarios pueden ver viviendas con permisos" ON viviendas;
DROP POLICY IF EXISTS "Usuarios pueden crear viviendas con permisos" ON viviendas;
DROP POLICY IF EXISTS "Usuarios pueden editar viviendas con permisos" ON viviendas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar viviendas con permisos" ON viviendas;

CREATE POLICY "Usuarios pueden ver viviendas con permisos"
  ON viviendas FOR SELECT TO authenticated
  USING (tiene_permiso(auth.uid(), 'viviendas', 'ver'));

CREATE POLICY "Usuarios pueden crear viviendas con permisos"
  ON viviendas FOR INSERT TO authenticated
  WITH CHECK (tiene_permiso(auth.uid(), 'viviendas', 'crear'));

CREATE POLICY "Usuarios pueden editar viviendas con permisos"
  ON viviendas FOR UPDATE TO authenticated
  USING (tiene_permiso(auth.uid(), 'viviendas', 'editar'))
  WITH CHECK (tiene_permiso(auth.uid(), 'viviendas', 'editar'));

CREATE POLICY "Usuarios pueden eliminar viviendas con permisos"
  ON viviendas FOR DELETE TO authenticated
  USING (tiene_permiso(auth.uid(), 'viviendas', 'eliminar'));

-- --- PROYECTOS ---
DROP POLICY IF EXISTS "Usuarios pueden ver proyectos con permisos" ON proyectos;
DROP POLICY IF EXISTS "Usuarios pueden crear proyectos con permisos" ON proyectos;
DROP POLICY IF EXISTS "Usuarios pueden editar proyectos con permisos" ON proyectos;
DROP POLICY IF EXISTS "Usuarios pueden eliminar proyectos con permisos" ON proyectos;

CREATE POLICY "Usuarios pueden ver proyectos con permisos"
  ON proyectos FOR SELECT TO authenticated
  USING (tiene_permiso(auth.uid(), 'proyectos', 'ver'));

CREATE POLICY "Usuarios pueden crear proyectos con permisos"
  ON proyectos FOR INSERT TO authenticated
  WITH CHECK (tiene_permiso(auth.uid(), 'proyectos', 'crear'));

CREATE POLICY "Usuarios pueden editar proyectos con permisos"
  ON proyectos FOR UPDATE TO authenticated
  USING (tiene_permiso(auth.uid(), 'proyectos', 'editar'))
  WITH CHECK (tiene_permiso(auth.uid(), 'proyectos', 'editar'));

CREATE POLICY "Usuarios pueden eliminar proyectos con permisos"
  ON proyectos FOR DELETE TO authenticated
  USING (tiene_permiso(auth.uid(), 'proyectos', 'eliminar'));

-- --- MANZANAS (heredan permisos de proyectos) ---
DROP POLICY IF EXISTS "Usuarios pueden ver manzanas con permisos" ON manzanas;
DROP POLICY IF EXISTS "Usuarios pueden crear manzanas con permisos" ON manzanas;
DROP POLICY IF EXISTS "Usuarios pueden editar manzanas con permisos" ON manzanas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar manzanas con permisos" ON manzanas;

CREATE POLICY "Usuarios pueden ver manzanas con permisos"
  ON manzanas FOR SELECT TO authenticated
  USING (tiene_permiso(auth.uid(), 'proyectos', 'ver'));

CREATE POLICY "Usuarios pueden crear manzanas con permisos"
  ON manzanas FOR INSERT TO authenticated
  WITH CHECK (tiene_permiso(auth.uid(), 'proyectos', 'crear'));

CREATE POLICY "Usuarios pueden editar manzanas con permisos"
  ON manzanas FOR UPDATE TO authenticated
  USING (tiene_permiso(auth.uid(), 'proyectos', 'editar'))
  WITH CHECK (tiene_permiso(auth.uid(), 'proyectos', 'editar'));

CREATE POLICY "Usuarios pueden eliminar manzanas con permisos"
  ON manzanas FOR DELETE TO authenticated
  USING (tiene_permiso(auth.uid(), 'proyectos', 'eliminar'));

-- --- CLIENTES ---
DROP POLICY IF EXISTS "Usuarios pueden ver clientes con permisos" ON clientes;
DROP POLICY IF EXISTS "Usuarios pueden crear clientes con permisos" ON clientes;
DROP POLICY IF EXISTS "Usuarios pueden editar clientes con permisos" ON clientes;
DROP POLICY IF EXISTS "Usuarios pueden eliminar clientes con permisos" ON clientes;

CREATE POLICY "Usuarios pueden ver clientes con permisos"
  ON clientes FOR SELECT TO authenticated
  USING (tiene_permiso(auth.uid(), 'clientes', 'ver'));

CREATE POLICY "Usuarios pueden crear clientes con permisos"
  ON clientes FOR INSERT TO authenticated
  WITH CHECK (tiene_permiso(auth.uid(), 'clientes', 'crear'));

CREATE POLICY "Usuarios pueden editar clientes con permisos"
  ON clientes FOR UPDATE TO authenticated
  USING (tiene_permiso(auth.uid(), 'clientes', 'editar'))
  WITH CHECK (tiene_permiso(auth.uid(), 'clientes', 'editar'));

CREATE POLICY "Usuarios pueden eliminar clientes con permisos"
  ON clientes FOR DELETE TO authenticated
  USING (tiene_permiso(auth.uid(), 'clientes', 'eliminar'));

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas abiertas USING(true) eliminadas de viviendas';
  RAISE NOTICE '✅ Políticas owner-based eliminadas de proyectos';
  RAISE NOTICE '✅ Políticas owner-based eliminadas de manzanas';
  RAISE NOTICE '✅ Política abierta eliminada de clientes';
  RAISE NOTICE '✅ Políticas basadas en tiene_permiso() re-creadas para viviendas, proyectos, manzanas, clientes';
  RAISE NOTICE '⚠️  Verificar: todos los roles deben tener permisos asignados en permisos_rol';
END $$;
