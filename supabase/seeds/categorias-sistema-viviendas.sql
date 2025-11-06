-- ============================================================================
-- SEED: Categorías del Sistema para Viviendas
-- ============================================================================
-- Ejecutar SOLO si las categorías no existen o necesitas recrearlas
-- Este script se auto-ejecuta también desde el hook useCategoriasSistemaViviendas
-- ============================================================================

-- ⚠️ ADVERTENCIA: Descomentar solo si quieres ELIMINAR categorías existentes
-- DELETE FROM categorias_documento WHERE 'viviendas' = ANY(modulos_permitidos) AND es_sistema = true;

-- ============================================================================
-- INSERTAR CATEGORÍAS DEL SISTEMA PARA VIVIENDAS
-- ============================================================================
-- Nota: Reemplaza 'USER_ID_AQUI' con el ID del usuario administrador
-- o ejecuta este script desde el hook que auto-obtiene el user_id
-- ============================================================================

INSERT INTO categorias_documento (
  user_id,
  nombre,
  descripcion,
  color,
  icono,
  orden,
  es_sistema,
  es_global,
  modulos_permitidos
) VALUES
-- 1. Certificado de Tradición
(
  (SELECT id FROM auth.users WHERE role = 'Administrador' LIMIT 1), -- Usuario admin
  'Certificado de Tradición',
  'Certificados de tradición y libertad de la propiedad',
  '#3B82F6', -- Azul
  'FileText',
  1,
  true,
  true,
  ARRAY['viviendas']::text[]
),

-- 2. Escrituras Públicas
(
  (SELECT id FROM auth.users WHERE role = 'Administrador' LIMIT 1),
  'Escrituras Públicas',
  'Escrituras de compraventa y documentos notariales',
  '#8B5CF6', -- Púrpura
  'FileSignature',
  2,
  true,
  true,
  ARRAY['viviendas']::text[]
),

-- 3. Planos Arquitectónicos
(
  (SELECT id FROM auth.users WHERE role = 'Administrador' LIMIT 1),
  'Planos Arquitectónicos',
  'Planos, diseños y renders de la vivienda',
  '#10B981', -- Verde
  'Ruler',
  3,
  true,
  true,
  ARRAY['viviendas']::text[]
),

-- 4. Licencias y Permisos
(
  (SELECT id FROM auth.users WHERE role = 'Administrador' LIMIT 1),
  'Licencias y Permisos',
  'Licencias de construcción y permisos municipales',
  '#F59E0B', -- Ámbar
  'Shield',
  4,
  true,
  true,
  ARRAY['viviendas']::text[]
),

-- 5. Avalúos Comerciales
(
  (SELECT id FROM auth.users WHERE role = 'Administrador' LIMIT 1),
  'Avalúos Comerciales',
  'Avalúos y valoraciones de la propiedad',
  '#EF4444', -- Rojo
  'DollarSign',
  5,
  true,
  true,
  ARRAY['viviendas']::text[]
),

-- 6. Fotos de Progreso
(
  (SELECT id FROM auth.users WHERE role = 'Administrador' LIMIT 1),
  'Fotos de Progreso',
  'Fotografías del avance y estado de la obra',
  '#06B6D4', -- Cyan
  'Camera',
  6,
  true,
  true,
  ARRAY['viviendas']::text[]
),

-- 7. Contrato de Promesa
(
  (SELECT id FROM auth.users WHERE role = 'Administrador' LIMIT 1),
  'Contrato de Promesa',
  'Contratos de promesa de compraventa',
  '#EC4899', -- Rosa
  'FileContract',
  7,
  true,
  true,
  ARRAY['viviendas']::text[]
),

-- 8. Recibos de Servicios
(
  (SELECT id FROM auth.users WHERE role = 'Administrador' LIMIT 1),
  'Recibos de Servicios',
  'Recibos de servicios públicos y pagos',
  '#14B8A6', -- Teal
  'Receipt',
  8,
  true,
  true,
  ARRAY['viviendas']::text[]
)
ON CONFLICT DO NOTHING; -- No insertar si ya existe

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT
  '✅ SEED COMPLETADO' AS status,
  COUNT(*) AS total_categorias
FROM categorias_documento
WHERE 'viviendas' = ANY(modulos_permitidos) AND es_sistema = true;

-- Debe retornar: total_categorias = 8
