-- =============================================
-- MIGRACIÓN: Sistema de Estados de Versión
-- Descripción: Agregar estados y metadata para
--              marcar versiones erróneas/obsoletas
-- Fecha: 2025-11-15
-- =============================================

-- 1. Agregar columna estado_version a documentos_vivienda
ALTER TABLE documentos_vivienda
ADD COLUMN IF NOT EXISTS estado_version VARCHAR(20) DEFAULT 'valida'
  CHECK (estado_version IN ('valida', 'erronea', 'obsoleta', 'supersedida'));

-- 2. Agregar columna motivo_estado a documentos_vivienda
ALTER TABLE documentos_vivienda
ADD COLUMN IF NOT EXISTS motivo_estado TEXT;

-- 3. Agregar referencia a versión que corrige (FK a mismo documento)
ALTER TABLE documentos_vivienda
ADD COLUMN IF NOT EXISTS version_corrige_a UUID REFERENCES documentos_vivienda(id);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_documentos_vivienda_estado_version
  ON documentos_vivienda(estado_version);

CREATE INDEX IF NOT EXISTS idx_documentos_vivienda_version_corrige
  ON documentos_vivienda(version_corrige_a);

-- 5. Comentarios descriptivos
COMMENT ON COLUMN documentos_vivienda.estado_version IS
  'Estado de la versión: valida (uso normal), erronea (archivo incorrecto), obsoleta (desactualizada), supersedida (reemplazada por otra)';

COMMENT ON COLUMN documentos_vivienda.motivo_estado IS
  'Descripción del motivo del estado (requerido si estado != valida)';

COMMENT ON COLUMN documentos_vivienda.version_corrige_a IS
  'ID de la versión correcta (usado cuando estado = erronea)';

-- 6. Llenar datos existentes (todas las versiones actuales son válidas)
UPDATE documentos_vivienda
SET estado_version = 'valida'
WHERE estado_version IS NULL;

-- 7. REPETIR PARA TABLA documentos_proyecto (si existe)
DO $$
BEGIN
  -- Verificar si tabla existe
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'documentos_proyecto'
  ) THEN
    -- Agregar columnas
    ALTER TABLE documentos_proyecto
    ADD COLUMN IF NOT EXISTS estado_version VARCHAR(20) DEFAULT 'valida'
      CHECK (estado_version IN ('valida', 'erronea', 'obsoleta', 'supersedida'));

    ALTER TABLE documentos_proyecto
    ADD COLUMN IF NOT EXISTS motivo_estado TEXT;

    ALTER TABLE documentos_proyecto
    ADD COLUMN IF NOT EXISTS version_corrige_a UUID REFERENCES documentos_proyecto(id);

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_documentos_proyecto_estado_version
      ON documentos_proyecto(estado_version);

    CREATE INDEX IF NOT EXISTS idx_documentos_proyecto_version_corrige
      ON documentos_proyecto(version_corrige_a);

    -- Comentarios
    COMMENT ON COLUMN documentos_proyecto.estado_version IS
      'Estado de la versión: valida (uso normal), erronea (archivo incorrecto), obsoleta (desactualizada), supersedida (reemplazada por otra)';

    COMMENT ON COLUMN documentos_proyecto.motivo_estado IS
      'Descripción del motivo del estado (requerido si estado != valida)';

    COMMENT ON COLUMN documentos_proyecto.version_corrige_a IS
      'ID de la versión correcta (usado cuando estado = erronea)';

    -- Llenar datos existentes
    UPDATE documentos_proyecto
    SET estado_version = 'valida'
    WHERE estado_version IS NULL;
  END IF;
END $$;
