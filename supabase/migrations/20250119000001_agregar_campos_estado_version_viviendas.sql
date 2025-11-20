-- ============================================================================
-- MIGRACIÓN: Agregar campos de estado de versión a documentos_vivienda
-- Descripción: Agrega estado_version y motivo_estado para versionado avanzado
-- Fecha: 2025-01-19
-- ============================================================================

-- 1. Agregar columna estado_version
ALTER TABLE documentos_vivienda
ADD COLUMN IF NOT EXISTS estado_version VARCHAR(50) DEFAULT 'valida';

-- 2. Agregar columna motivo_estado
ALTER TABLE documentos_vivienda
ADD COLUMN IF NOT EXISTS motivo_estado TEXT;

-- 3. Agregar columna version_corrige_a (para correcciones)
ALTER TABLE documentos_vivienda
ADD COLUMN IF NOT EXISTS version_corrige_a UUID REFERENCES documentos_vivienda(id) ON DELETE SET NULL;

-- 4. Comentarios en las columnas
COMMENT ON COLUMN documentos_vivienda.estado_version IS 'Estado de la versión: valida, erronea, obsoleta, supersedida';
COMMENT ON COLUMN documentos_vivienda.motivo_estado IS 'Motivo del estado (ej: razón de error u obsolescencia)';
COMMENT ON COLUMN documentos_vivienda.version_corrige_a IS 'FK a la versión que esta versión corrige (para tracking de correcciones)';

-- 5. Constraint para estado_version (ALINEADO CON PROYECTOS)
ALTER TABLE documentos_vivienda
ADD CONSTRAINT documentos_vivienda_estado_version_check
CHECK (estado_version IN ('valida', 'erronea', 'obsoleta', 'supersedida'));

-- 6. Índice para búsquedas por estado_version
CREATE INDEX IF NOT EXISTS idx_documentos_vivienda_estado_version
ON documentos_vivienda(estado_version);

-- 7. Actualizar versiones existentes a 'valida'
UPDATE documentos_vivienda
SET estado_version = 'valida'
WHERE estado_version IS NULL;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Columnas agregadas:';
  RAISE NOTICE '   - estado_version (VARCHAR(50))';
  RAISE NOTICE '   - motivo_estado (TEXT)';
  RAISE NOTICE '   - version_corrige_a (UUID FK)';
  RAISE NOTICE '✅ Constraint agregado: estado_version IN (valida, erronea, obsoleta, supersedida)';
  RAISE NOTICE '✅ Índice creado: idx_documentos_vivienda_estado_version';
  RAISE NOTICE '✅ Sistema alineado con módulo de proyectos';
END $$;
