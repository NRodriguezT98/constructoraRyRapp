-- ============================================
-- MIGRACIÓN: Agregar campo tipo_entidad a categorias_documento
-- Sistema híbrido para compartir/separar categorías entre proyectos y clientes
-- ============================================

-- 1. Agregar columna tipo_entidad
ALTER TABLE public.categorias_documento
ADD COLUMN IF NOT EXISTS tipo_entidad VARCHAR(50) NOT NULL DEFAULT 'proyecto';

-- 2. Agregar constraint para validar valores permitidos
ALTER TABLE public.categorias_documento
ADD CONSTRAINT check_tipo_entidad
CHECK (tipo_entidad IN ('proyecto', 'cliente', 'ambos'));

-- 3. Crear índice para mejorar performance en filtros
CREATE INDEX IF NOT EXISTS idx_categorias_tipo_entidad
ON public.categorias_documento(tipo_entidad);

-- 4. Actualizar categorías existentes (si las hay)
-- Por defecto, todas las categorías existentes se marcan como 'proyecto'
-- Puedes cambiar manualmente las que deban ser 'ambos' después

-- 5. Agregar comentario
COMMENT ON COLUMN public.categorias_documento.tipo_entidad IS
'Define dónde se usa la categoría: proyecto (solo proyectos), cliente (solo clientes), ambos (proyectos y clientes)';

-- ============================================
-- INSERTAR CATEGORÍAS POR DEFECTO
-- ============================================

-- Insertar categorías para el usuario actual (auth.uid())
-- IMPORTANTE: Debes estar logueado en Supabase para que esto funcione

-- Categorías SOLO para PROYECTOS
INSERT INTO public.categorias_documento (user_id, nombre, color, icono, tipo_entidad)
SELECT
  auth.uid()::text,
  nombre,
  color,
  icono,
  tipo_entidad
FROM (VALUES
  ('Licencias', '#3B82F6', '📜', 'proyecto'),
  ('Planos Arquitectónicos', '#10B981', '📐', 'proyecto'),
  ('Estudios Técnicos', '#8B5CF6', '🔬', 'proyecto'),
  ('Permisos Construcción', '#F59E0B', '🏗️', 'proyecto')
) AS datos(nombre, color, icono, tipo_entidad)
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, nombre) DO NOTHING;

-- Categorías SOLO para CLIENTES
INSERT INTO public.categorias_documento (user_id, nombre, color, icono, tipo_entidad)
SELECT
  auth.uid()::text,
  nombre,
  color,
  icono,
  tipo_entidad
FROM (VALUES
  ('Identificación', '#EC4899', '🪪', 'cliente'),
  ('Referencias Laborales', '#6366F1', '💼', 'cliente'),
  ('Documentos Financieros', '#14B8A6', '💰', 'cliente'),
  ('Extractos Bancarios', '#84CC16', '🏦', 'cliente')
) AS datos(nombre, color, icono, tipo_entidad)
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, nombre) DO NOTHING;

-- Categorías COMPARTIDAS (proyectos y clientes)
INSERT INTO public.categorias_documento (user_id, nombre, color, icono, tipo_entidad)
SELECT
  auth.uid()::text,
  nombre,
  color,
  icono,
  tipo_entidad
FROM (VALUES
  ('Contratos', '#EF4444', '📄', 'ambos'),
  ('Facturas', '#0EA5E9', '🧾', 'ambos'),
  ('Comprobantes de Pago', '#22C55E', '💳', 'ambos')
) AS datos(nombre, color, icono, tipo_entidad)
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, nombre) DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver todas las categorías agrupadas por tipo_entidad
SELECT
  tipo_entidad,
  COUNT(*) as total,
  STRING_AGG(nombre, ', ') as categorias
FROM public.categorias_documento
GROUP BY tipo_entidad
ORDER BY tipo_entidad;

-- Ver estructura actualizada
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'categorias_documento'
ORDER BY ordinal_position;
