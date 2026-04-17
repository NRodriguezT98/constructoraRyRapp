-- ============================================
-- MIGRACIÓN: Sistema de Carpetas para Documentos
-- Fecha: 2026-04-17
-- Descripción: Agrega sistema de carpetas tipo Google Drive
--              para organizar documentos por entidad.
--              carpeta_id = NULL significa "raíz" (sin cambio para docs existentes)
-- ============================================

BEGIN;

-- ============================================
-- 1. TABLA: carpetas_documentos
-- ============================================
CREATE TABLE IF NOT EXISTS carpetas_documentos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Referencia a la entidad propietaria (proyecto, vivienda, o cliente)
  entidad_id uuid NOT NULL,
  tipo_entidad text NOT NULL CHECK (tipo_entidad IN ('proyecto', 'vivienda', 'cliente')),

  -- Jerarquía (auto-referencial para sub-carpetas)
  padre_id uuid REFERENCES carpetas_documentos(id) ON DELETE CASCADE,

  -- Datos de la carpeta
  nombre text NOT NULL,
  descripcion text,
  color text DEFAULT '#6B7280', -- gris por defecto
  icono text DEFAULT 'Folder',  -- nombre de icono Lucide
  orden integer DEFAULT 0,

  -- Auditoría
  creado_por uuid REFERENCES auth.users(id),
  fecha_creacion timestamptz DEFAULT now(),
  fecha_actualizacion timestamptz DEFAULT now(),

  -- Constraint: nombre único dentro del mismo nivel y entidad
  CONSTRAINT uq_carpeta_nombre_nivel UNIQUE (entidad_id, tipo_entidad, padre_id, nombre)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_carpetas_entidad ON carpetas_documentos(entidad_id, tipo_entidad);
CREATE INDEX IF NOT EXISTS idx_carpetas_padre ON carpetas_documentos(padre_id);

-- ============================================
-- 2. AGREGAR carpeta_id A LAS 3 TABLAS DE DOCUMENTOS
-- ============================================

-- documentos_proyecto
ALTER TABLE documentos_proyecto
  ADD COLUMN IF NOT EXISTS carpeta_id uuid REFERENCES carpetas_documentos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_doc_proyecto_carpeta ON documentos_proyecto(carpeta_id);

-- documentos_vivienda
ALTER TABLE documentos_vivienda
  ADD COLUMN IF NOT EXISTS carpeta_id uuid REFERENCES carpetas_documentos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_doc_vivienda_carpeta ON documentos_vivienda(carpeta_id);

-- documentos_cliente
ALTER TABLE documentos_cliente
  ADD COLUMN IF NOT EXISTS carpeta_id uuid REFERENCES carpetas_documentos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_doc_cliente_carpeta ON documentos_cliente(carpeta_id);

-- ============================================
-- 3. RLS POLICIES
-- ============================================

ALTER TABLE carpetas_documentos ENABLE ROW LEVEL SECURITY;

-- Lectura: usuarios autenticados pueden ver carpetas
CREATE POLICY "Usuarios autenticados pueden ver carpetas"
  ON carpetas_documentos FOR SELECT
  TO authenticated
  USING (true);

-- Crear: usuarios autenticados pueden crear carpetas
CREATE POLICY "Usuarios autenticados pueden crear carpetas"
  ON carpetas_documentos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Actualizar: usuarios autenticados pueden actualizar carpetas
CREATE POLICY "Usuarios autenticados pueden actualizar carpetas"
  ON carpetas_documentos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Eliminar: usuarios autenticados pueden eliminar carpetas
CREATE POLICY "Usuarios autenticados pueden eliminar carpetas"
  ON carpetas_documentos FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 4. TRIGGER: Actualizar fecha_actualizacion
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_fecha_carpeta()
RETURNS trigger AS $$
BEGIN
  NEW.fecha_actualizacion = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_carpetas_actualizar_fecha
  BEFORE UPDATE ON carpetas_documentos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_carpeta();

COMMIT;
