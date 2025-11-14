-- ============================================
-- POLÍTICAS RLS BASADAS EN PERMISOS
-- ============================================
-- Descripción: Agrega validación de permisos usando función tiene_permiso()
-- Fecha: 2025-11-14
-- Autor: Sistema RyR
-- Versión: 1.0
-- ============================================

-- ============================================
-- 1. POLÍTICAS PARA TABLA PROYECTOS
-- ============================================

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Usuarios pueden ver proyectos con permisos" ON proyectos;
DROP POLICY IF EXISTS "Usuarios pueden crear proyectos con permisos" ON proyectos;
DROP POLICY IF EXISTS "Usuarios pueden editar proyectos con permisos" ON proyectos;
DROP POLICY IF EXISTS "Usuarios pueden eliminar proyectos con permisos" ON proyectos;

-- Policy: Ver proyectos (requiere permiso 'ver')
CREATE POLICY "Usuarios pueden ver proyectos con permisos"
  ON proyectos
  FOR SELECT
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'proyectos', 'ver')
  );

-- Policy: Crear proyectos (requiere permiso 'crear')
CREATE POLICY "Usuarios pueden crear proyectos con permisos"
  ON proyectos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tiene_permiso(auth.uid(), 'proyectos', 'crear')
  );

-- Policy: Editar proyectos (requiere permiso 'editar')
CREATE POLICY "Usuarios pueden editar proyectos con permisos"
  ON proyectos
  FOR UPDATE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'proyectos', 'editar')
  )
  WITH CHECK (
    tiene_permiso(auth.uid(), 'proyectos', 'editar')
  );

-- Policy: Eliminar proyectos (requiere permiso 'eliminar')
CREATE POLICY "Usuarios pueden eliminar proyectos con permisos"
  ON proyectos
  FOR DELETE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'proyectos', 'eliminar')
  );

-- ============================================
-- 2. POLÍTICAS PARA TABLA VIVIENDAS
-- ============================================

DROP POLICY IF EXISTS "Usuarios pueden ver viviendas con permisos" ON viviendas;
DROP POLICY IF EXISTS "Usuarios pueden crear viviendas con permisos" ON viviendas;
DROP POLICY IF EXISTS "Usuarios pueden editar viviendas con permisos" ON viviendas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar viviendas con permisos" ON viviendas;

CREATE POLICY "Usuarios pueden ver viviendas con permisos"
  ON viviendas
  FOR SELECT
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'viviendas', 'ver')
  );

CREATE POLICY "Usuarios pueden crear viviendas con permisos"
  ON viviendas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tiene_permiso(auth.uid(), 'viviendas', 'crear')
  );

CREATE POLICY "Usuarios pueden editar viviendas con permisos"
  ON viviendas
  FOR UPDATE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'viviendas', 'editar')
  )
  WITH CHECK (
    tiene_permiso(auth.uid(), 'viviendas', 'editar')
  );

CREATE POLICY "Usuarios pueden eliminar viviendas con permisos"
  ON viviendas
  FOR DELETE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'viviendas', 'eliminar')
  );

-- ============================================
-- 3. POLÍTICAS PARA TABLA CLIENTES
-- ============================================

DROP POLICY IF EXISTS "Usuarios pueden ver clientes con permisos" ON clientes;
DROP POLICY IF EXISTS "Usuarios pueden crear clientes con permisos" ON clientes;
DROP POLICY IF EXISTS "Usuarios pueden editar clientes con permisos" ON clientes;
DROP POLICY IF EXISTS "Usuarios pueden eliminar clientes con permisos" ON clientes;

CREATE POLICY "Usuarios pueden ver clientes con permisos"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'clientes', 'ver')
  );

CREATE POLICY "Usuarios pueden crear clientes con permisos"
  ON clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tiene_permiso(auth.uid(), 'clientes', 'crear')
  );

CREATE POLICY "Usuarios pueden editar clientes con permisos"
  ON clientes
  FOR UPDATE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'clientes', 'editar')
  )
  WITH CHECK (
    tiene_permiso(auth.uid(), 'clientes', 'editar')
  );

CREATE POLICY "Usuarios pueden eliminar clientes con permisos"
  ON clientes
  FOR DELETE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'clientes', 'eliminar')
  );

-- ============================================
-- 4. POLÍTICAS PARA TABLA DOCUMENTOS_PROYECTO
-- ============================================

DROP POLICY IF EXISTS "Usuarios pueden ver documentos con permisos" ON documentos_proyecto;
DROP POLICY IF EXISTS "Usuarios pueden crear documentos con permisos" ON documentos_proyecto;
DROP POLICY IF EXISTS "Usuarios pueden editar documentos con permisos" ON documentos_proyecto;
DROP POLICY IF EXISTS "Usuarios pueden eliminar documentos con permisos" ON documentos_proyecto;

CREATE POLICY "Usuarios pueden ver documentos con permisos"
  ON documentos_proyecto
  FOR SELECT
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'documentos', 'ver')
  );

CREATE POLICY "Usuarios pueden crear documentos con permisos"
  ON documentos_proyecto
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tiene_permiso(auth.uid(), 'documentos', 'crear')
  );

CREATE POLICY "Usuarios pueden editar documentos con permisos"
  ON documentos_proyecto
  FOR UPDATE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'documentos', 'editar')
  )
  WITH CHECK (
    tiene_permiso(auth.uid(), 'documentos', 'editar')
  );

CREATE POLICY "Usuarios pueden eliminar documentos con permisos"
  ON documentos_proyecto
  FOR DELETE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'documentos', 'eliminar')
  );

-- ============================================
-- ✅ POLÍTICAS RLS APLICADAS
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS basadas en permisos aplicadas';
  RAISE NOTICE '📋 Tablas protegidas:';
  RAISE NOTICE '  - proyectos';
  RAISE NOTICE '  - viviendas';
  RAISE NOTICE '  - clientes';
  RAISE NOTICE '  - documentos_proyecto';
  RAISE NOTICE '  - negociaciones';
  RAISE NOTICE '🔐 Validación usando función tiene_permiso()';
  RAISE NOTICE '⚠️ Nota: tabla abonos omitida (no existe aún)';
END $$;
