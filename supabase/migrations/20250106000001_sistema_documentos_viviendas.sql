-- ============================================================================
-- MIGRACIÓN: Sistema de Documentos para Viviendas
-- Descripción: Crea tabla documentos_vivienda + categorías predefinidas
-- Fecha: 2025-01-06
-- ============================================================================

-- 1. Agregar columna es_sistema a categorias_documento (si no existe)
ALTER TABLE categorias_documento
ADD COLUMN IF NOT EXISTS es_sistema BOOLEAN DEFAULT false;

-- 2. Comentario en la columna
COMMENT ON COLUMN categorias_documento.es_sistema IS 'Indica si la categoría es del sistema (no se puede eliminar)';

-- 3. Crear tabla documentos_vivienda
CREATE TABLE IF NOT EXISTS documentos_vivienda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vivienda_id UUID NOT NULL REFERENCES viviendas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_documento(id) ON DELETE SET NULL,

  -- Metadata del archivo
  titulo VARCHAR(500) NOT NULL,
  descripcion TEXT,
  nombre_archivo VARCHAR(500) NOT NULL,
  nombre_original VARCHAR(500) NOT NULL,
  tamano_bytes BIGINT NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  url_storage TEXT NOT NULL,

  -- Organización
  etiquetas TEXT[],

  -- Versionado
  version INTEGER NOT NULL DEFAULT 1,
  es_version_actual BOOLEAN NOT NULL DEFAULT true,
  documento_padre_id UUID REFERENCES documentos_vivienda(id) ON DELETE SET NULL,

  -- Estado
  estado VARCHAR(50) NOT NULL DEFAULT 'activo',
  metadata JSONB DEFAULT '{}',

  -- Auditoría
  subido_por TEXT NOT NULL,
  fecha_documento TIMESTAMP WITH TIME ZONE,
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  es_importante BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT documentos_vivienda_estado_check
    CHECK (estado IN ('activo', 'archivado', 'eliminado'))
);

-- 4. Comentarios en la tabla
COMMENT ON TABLE documentos_vivienda IS 'Almacena documentos asociados a viviendas';
COMMENT ON COLUMN documentos_vivienda.vivienda_id IS 'FK a la vivienda propietaria del documento';
COMMENT ON COLUMN documentos_vivienda.categoria_id IS 'FK a categoría del documento (puede ser NULL)';
COMMENT ON COLUMN documentos_vivienda.version IS 'Número de versión del documento (para versionado)';
COMMENT ON COLUMN documentos_vivienda.es_version_actual IS 'Indica si esta es la versión más reciente';
COMMENT ON COLUMN documentos_vivienda.documento_padre_id IS 'FK al documento original (para versiones)';

-- 5. Índices para performance
CREATE INDEX idx_documentos_vivienda_vivienda_id
  ON documentos_vivienda(vivienda_id);

CREATE INDEX idx_documentos_vivienda_categoria_id
  ON documentos_vivienda(categoria_id);

CREATE INDEX idx_documentos_vivienda_estado
  ON documentos_vivienda(estado);

CREATE INDEX idx_documentos_vivienda_subido_por
  ON documentos_vivienda(subido_por);

CREATE INDEX idx_documentos_vivienda_fecha_creacion
  ON documentos_vivienda(fecha_creacion DESC);

CREATE INDEX idx_documentos_vivienda_es_version_actual
  ON documentos_vivienda(es_version_actual)
  WHERE es_version_actual = true;

-- 6. Trigger para fecha_actualizacion
CREATE OR REPLACE FUNCTION update_documentos_vivienda_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_documentos_vivienda_updated_at
  BEFORE UPDATE ON documentos_vivienda
  FOR EACH ROW
  EXECUTE FUNCTION update_documentos_vivienda_updated_at();

-- 7. RLS Policies
ALTER TABLE documentos_vivienda ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Usuarios autenticados pueden ver documentos
CREATE POLICY "Usuarios autenticados pueden ver documentos de viviendas"
ON documentos_vivienda FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policy: INSERT - Usuarios autenticados pueden crear documentos
CREATE POLICY "Usuarios autenticados pueden crear documentos de viviendas"
ON documentos_vivienda FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: UPDATE - Usuarios pueden actualizar documentos
CREATE POLICY "Usuarios autenticados pueden actualizar documentos de viviendas"
ON documentos_vivienda FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Policy: DELETE - Solo admins pueden eliminar documentos
CREATE POLICY "Solo admins pueden eliminar documentos de viviendas"
ON documentos_vivienda FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND rol = 'Administrador'
  )
);

-- 8. Insertar categorías predefinidas del sistema para viviendas
INSERT INTO categorias_documento (
  user_id,
  nombre,
  descripcion,
  color,
  icono,
  modulos_permitidos,
  es_sistema,
  es_global,
  orden
)
SELECT
  (SELECT id FROM usuarios WHERE rol = 'Administrador' LIMIT 1), -- Usuario administrador
  categoria.nombre,
  categoria.descripcion,
  categoria.color,
  categoria.icono,
  ARRAY['viviendas']::text[],
  true, -- Es del sistema
  false, -- No es global
  categoria.orden
FROM (VALUES
  ('Certificado de Tradición', 'Certificados de libertad y tradición de la propiedad', '#10b981', 'FileText', 1),
  ('Escrituras Públicas', 'Escrituras de compraventa y documentos notariales', '#3b82f6', 'FileCheck', 2),
  ('Planos Arquitectónicos', 'Planos de diseño, construcción y arquitectura', '#f59e0b', 'Ruler', 3),
  ('Licencias y Permisos', 'Licencias de construcción y permisos municipales', '#8b5cf6', 'Shield', 4),
  ('Avalúos Comerciales', 'Avalúos y certificados de valor comercial', '#06b6d4', 'DollarSign', 5),
  ('Fotos de Progreso', 'Registro fotográfico del estado de la vivienda', '#ec4899', 'Camera', 6),
  ('Contrato de Promesa', 'Contratos de promesa de compraventa', '#f43f5e', 'FileSignature', 7),
  ('Recibos de Servicios', 'Recibos de servicios públicos y pagos', '#84cc16', 'Receipt', 8)
) AS categoria(nombre, descripcion, color, icono, orden)
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_documento
  WHERE nombre = categoria.nombre
  AND 'viviendas' = ANY(modulos_permitidos)
  AND es_sistema = true
);

-- 9. Índice en categorias_documento para búsquedas de sistema
CREATE INDEX IF NOT EXISTS idx_categorias_documento_sistema_modulo
  ON categorias_documento(es_sistema, modulos_permitidos)
  WHERE es_sistema = true;

-- 10. Función helper para obtener categoría de sistema por nombre
CREATE OR REPLACE FUNCTION obtener_categoria_sistema_vivienda(
  p_nombre_categoria TEXT
)
RETURNS UUID AS $$
DECLARE
  v_categoria_id UUID;
BEGIN
  SELECT id INTO v_categoria_id
  FROM categorias_documento
  WHERE nombre = p_nombre_categoria
    AND 'viviendas' = ANY(modulos_permitidos)
    AND es_sistema = true
  LIMIT 1;

  RETURN v_categoria_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION obtener_categoria_sistema_vivienda IS
  'Obtiene el ID de una categoría de sistema para viviendas por su nombre';

-- 11. Vista para documentos con información relacionada
CREATE OR REPLACE VIEW vista_documentos_vivienda AS
SELECT
  dv.id,
  dv.vivienda_id,
  dv.categoria_id,
  dv.titulo,
  dv.descripcion,
  dv.nombre_archivo,
  dv.nombre_original,
  dv.tamano_bytes,
  dv.tipo_mime,
  dv.url_storage,
  dv.etiquetas,
  dv.version,
  dv.es_version_actual,
  dv.estado,
  dv.subido_por,
  dv.fecha_documento,
  dv.fecha_vencimiento,
  dv.es_importante,
  dv.fecha_creacion,
  dv.fecha_actualizacion,

  -- Información de categoría
  cd.nombre AS categoria_nombre,
  cd.color AS categoria_color,
  cd.icono AS categoria_icono,
  cd.es_sistema AS categoria_es_sistema,

  -- Información de vivienda
  v.numero AS vivienda_numero,
  v.manzana_id,

  -- Información de manzana
  m.nombre AS manzana_nombre,
  m.proyecto_id,

  -- Información de proyecto
  p.nombre AS proyecto_nombre

FROM documentos_vivienda dv
LEFT JOIN categorias_documento cd ON dv.categoria_id = cd.id
LEFT JOIN viviendas v ON dv.vivienda_id = v.id
LEFT JOIN manzanas m ON v.manzana_id = m.id
LEFT JOIN proyectos p ON m.proyecto_id = p.id
WHERE dv.estado = 'activo';

COMMENT ON VIEW vista_documentos_vivienda IS
  'Vista enriquecida de documentos con información de categoría, vivienda, manzana y proyecto';

-- 12. Políticas RLS en categorias_documento para categorías de sistema
DROP POLICY IF EXISTS "Usuarios pueden ver categorías del sistema" ON categorias_documento;
CREATE POLICY "Usuarios pueden ver categorías del sistema"
ON categorias_documento FOR SELECT
USING (
  es_sistema = true OR
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "Solo admins pueden modificar categorías del sistema" ON categorias_documento;
CREATE POLICY "Solo admins pueden modificar categorías del sistema"
ON categorias_documento FOR UPDATE
USING (
  CASE
    WHEN es_sistema = true THEN
      EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid() AND rol = 'Administrador'
      )
    ELSE user_id = auth.uid()
  END
);

DROP POLICY IF EXISTS "Solo admins pueden eliminar categorías del sistema" ON categorias_documento;
CREATE POLICY "Solo admins pueden eliminar categorías del sistema"
ON categorias_documento FOR DELETE
USING (
  CASE
    WHEN es_sistema = true THEN
      EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid() AND rol = 'Administrador'
      )
    ELSE user_id = auth.uid()
  END
);

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
