-- =============================================
-- MIGRACIÓN: Metadata para Reemplazo de Archivos
-- Descripción: Agregar campos para auditoría de reemplazos
-- Fecha: 2025-11-15
-- =============================================

-- 1. Verificar si columna metadata existe en documentos_vivienda
-- Si no existe, crearla como JSONB
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documentos_vivienda'
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE documentos_vivienda
    ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 2. Comentario descriptivo
COMMENT ON COLUMN documentos_vivienda.metadata IS
  'Metadata en formato JSON. Incluye: reemplazado (bool), fecha_reemplazo (ISO), motivo_reemplazo (string), archivo_original_backup (string), nombre_original_previo (string), tamano_bytes_previo (number)';

-- 3. Índice para búsquedas de reemplazos
CREATE INDEX IF NOT EXISTS idx_documentos_vivienda_metadata_reemplazado
  ON documentos_vivienda USING gin(metadata);

-- 4. REPETIR PARA documentos_proyecto (si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'documentos_proyecto'
  ) THEN
    -- Verificar si columna existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'documentos_proyecto'
      AND column_name = 'metadata'
    ) THEN
      ALTER TABLE documentos_proyecto
      ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Comentario
    COMMENT ON COLUMN documentos_proyecto.metadata IS
      'Metadata en formato JSON. Incluye: reemplazado (bool), fecha_reemplazo (ISO), motivo_reemplazo (string), archivo_original_backup (string), nombre_original_previo (string), tamano_bytes_previo (number)';

    -- Índice
    CREATE INDEX IF NOT EXISTS idx_documentos_proyecto_metadata_reemplazado
      ON documentos_proyecto USING gin(metadata);
  END IF;
END $$;
