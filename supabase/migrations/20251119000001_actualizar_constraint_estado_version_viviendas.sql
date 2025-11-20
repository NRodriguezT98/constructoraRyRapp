-- ============================================================================
-- MIGRACIÓN: Actualizar constraint de estado_version en documentos_vivienda
-- Descripción: Alinear estados con módulo de proyectos (erronea, obsoleta, supersedida)
-- Fecha: 2025-11-19
-- ============================================================================

-- 1. Eliminar constraint antiguo
ALTER TABLE documentos_vivienda
DROP CONSTRAINT IF EXISTS documentos_vivienda_estado_version_check;

-- 2. Crear constraint nuevo con estados correctos (ALINEADO CON PROYECTOS)
ALTER TABLE documentos_vivienda
ADD CONSTRAINT documentos_vivienda_estado_version_check
CHECK (estado_version IN ('valida', 'erronea', 'obsoleta', 'supersedida'));

-- 3. Actualizar comentarios
COMMENT ON COLUMN documentos_vivienda.estado_version IS 'Estado de la versión: valida, erronea, obsoleta, supersedida (ALINEADO CON PROYECTOS)';
COMMENT ON COLUMN documentos_vivienda.motivo_estado IS 'Motivo del estado (ej: razón de error u obsolescencia)';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Constraint actualizado: estado_version IN (valida, erronea, obsoleta, supersedida)';
  RAISE NOTICE '✅ Sistema de estados ALINEADO con módulo de proyectos';
END $$;
