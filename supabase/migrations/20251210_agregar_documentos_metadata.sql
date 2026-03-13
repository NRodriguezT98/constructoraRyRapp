-- ============================================
-- AGREGAR CAMPO documentos_metadata A procesos_negociacion
-- ============================================
-- Fecha: 2025-12-10
-- Descripción: Agrega campo JSONB para almacenar metadata de documentos
--              temporales (en Storage pero no en BD) hasta completar el paso

-- 1. Agregar columna documentos_metadata
ALTER TABLE procesos_negociacion
ADD COLUMN IF NOT EXISTS documentos_metadata JSONB;

-- 2. Comentario explicativo
COMMENT ON COLUMN procesos_negociacion.documentos_metadata IS
'Metadata de documentos temporales en Storage (no en BD). Se guarda en documentos_cliente al completar el paso. Key: nombre_documento, Value: {storagePath, clienteId, categoriaId, etc.}';

-- 3. Confirmación
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'procesos_negociacion'
    AND column_name = 'documentos_metadata'
  ) THEN
    RAISE NOTICE '✅ Campo documentos_metadata agregado exitosamente';
  ELSE
    RAISE WARNING '⚠️ Error: Campo documentos_metadata no se agregó';
  END IF;
END $$;
