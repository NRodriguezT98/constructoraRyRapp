-- ============================================
-- TABLA: documentos_cliente
-- Sistema de documentos para clientes
-- Replica estructura de documentos_proyecto
-- ============================================

-- Crear tabla principal
CREATE TABLE IF NOT EXISTS public.documentos_cliente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias_documento(id) ON DELETE SET NULL,

  -- Información del documento
  titulo VARCHAR(500) NOT NULL,
  descripcion TEXT,

  -- Información del archivo
  nombre_archivo VARCHAR(500) NOT NULL,
  nombre_original VARCHAR(500) NOT NULL,
  tamano_bytes BIGINT NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  url_storage TEXT NOT NULL,

  -- Organización
  etiquetas TEXT[],

  -- Sistema de versionado
  version INTEGER NOT NULL DEFAULT 1,
  es_version_actual BOOLEAN NOT NULL DEFAULT TRUE,
  documento_padre_id UUID REFERENCES public.documentos_cliente(id) ON DELETE SET NULL,

  -- Estado y metadata
  estado VARCHAR(50) NOT NULL DEFAULT 'activo',
  metadata JSONB DEFAULT '{}',

  -- Auditoría
  subido_por TEXT NOT NULL,
  fecha_documento TIMESTAMP WITH TIME ZONE,
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  es_importante BOOLEAN DEFAULT FALSE,

  -- Timestamps
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Búsqueda por cliente
CREATE INDEX idx_docs_cliente_cliente_id ON public.documentos_cliente(cliente_id);

-- Filtro por categoría
CREATE INDEX idx_docs_cliente_categoria_id ON public.documentos_cliente(categoria_id);

-- Filtro por estado
CREATE INDEX idx_docs_cliente_estado ON public.documentos_cliente(estado);

-- Documentos próximos a vencer
CREATE INDEX idx_docs_cliente_fecha_vencimiento ON public.documentos_cliente(fecha_vencimiento);

-- Versionado
CREATE INDEX idx_docs_cliente_documento_padre_id ON public.documentos_cliente(documento_padre_id);

-- Búsqueda por etiquetas (GIN index para arrays)
CREATE INDEX idx_docs_cliente_etiquetas ON public.documentos_cliente USING gin(etiquetas);

-- Filtro de importantes
CREATE INDEX idx_docs_cliente_importante ON public.documentos_cliente(es_importante);

-- ============================================
-- TRIGGERS
-- ============================================

-- Actualizar fecha_actualizacion automáticamente
CREATE TRIGGER update_documentos_cliente_fecha_actualizacion
  BEFORE UPDATE ON public.documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.documentos_cliente ENABLE ROW LEVEL SECURITY;

-- Política: SELECT (Ver documentos)
CREATE POLICY "Los usuarios pueden ver sus documentos de clientes"
  ON public.documentos_cliente FOR SELECT
  USING (auth.uid()::text = subido_por);

-- Política: INSERT (Crear documentos)
CREATE POLICY "Los usuarios pueden crear documentos de sus clientes"
  ON public.documentos_cliente FOR INSERT
  WITH CHECK (auth.uid()::text = subido_por);

-- Política: UPDATE (Actualizar documentos)
CREATE POLICY "Los usuarios pueden actualizar sus documentos de clientes"
  ON public.documentos_cliente FOR UPDATE
  USING (auth.uid()::text = subido_por)
  WITH CHECK (auth.uid()::text = subido_por);

-- Política: DELETE (Eliminar documentos)
CREATE POLICY "Los usuarios pueden eliminar sus documentos de clientes"
  ON public.documentos_cliente FOR DELETE
  USING (auth.uid()::text = subido_por);

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE public.documentos_cliente IS 'Almacena documentos asociados a clientes (cédulas, referencias, cartas laborales, etc.)';
COMMENT ON COLUMN public.documentos_cliente.cliente_id IS 'FK al cliente dueño del documento';
COMMENT ON COLUMN public.documentos_cliente.categoria_id IS 'FK a categoria_documento (compartida con proyectos)';
COMMENT ON COLUMN public.documentos_cliente.url_storage IS 'Path en Supabase Storage: {user_id}/{cliente_id}/{nombre_archivo}';
COMMENT ON COLUMN public.documentos_cliente.version IS 'Número de versión del documento';
COMMENT ON COLUMN public.documentos_cliente.es_version_actual IS 'TRUE si es la versión más reciente';
COMMENT ON COLUMN public.documentos_cliente.documento_padre_id IS 'FK al documento original si es una versión';
COMMENT ON COLUMN public.documentos_cliente.estado IS 'activo, archivado, eliminado';
COMMENT ON COLUMN public.documentos_cliente.subido_por IS 'UUID del usuario que subió el documento';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver estructura de la tabla
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'documentos_cliente'
ORDER BY ordinal_position;

-- Ver índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'documentos_cliente';

-- Ver políticas RLS
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'documentos_cliente';
