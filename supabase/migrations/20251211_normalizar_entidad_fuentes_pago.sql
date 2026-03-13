-- =====================================================
-- Migración: Normalización de entidad en fuentes_pago
-- Fecha: 2025-12-11
-- Descripción: Reemplaza campo text 'entidad' por FK a entidades_financieras
-- =====================================================

-- =====================================================
-- PASO 1: Agregar nueva columna FK (nullable)
-- =====================================================
ALTER TABLE public.fuentes_pago
ADD COLUMN IF NOT EXISTS entidad_financiera_id UUID REFERENCES public.entidades_financieras(id) ON DELETE SET NULL;

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_fuentes_pago_entidad_financiera_id
ON public.fuentes_pago(entidad_financiera_id);

-- =====================================================
-- PASO 2: Migrar datos existentes
-- =====================================================

-- Función helper para mapear texto a ID
CREATE OR REPLACE FUNCTION map_entidad_to_id(entidad_text TEXT)
RETURNS UUID AS $$
DECLARE
  entidad_id UUID;
BEGIN
  -- Normalizar texto (lowercase, trim)
  entidad_text := LOWER(TRIM(entidad_text));

  -- Buscar por nombre (case insensitive)
  SELECT id INTO entidad_id
  FROM entidades_financieras
  WHERE LOWER(nombre) = entidad_text
  LIMIT 1;

  -- Si no se encuentra, buscar por código
  IF entidad_id IS NULL THEN
    SELECT id INTO entidad_id
    FROM entidades_financieras
    WHERE codigo = entidad_text
    LIMIT 1;
  END IF;

  -- Si no se encuentra, buscar por coincidencia parcial
  IF entidad_id IS NULL THEN
    SELECT id INTO entidad_id
    FROM entidades_financieras
    WHERE LOWER(nombre) LIKE '%' || entidad_text || '%'
    LIMIT 1;
  END IF;

  RETURN entidad_id;
END;
$$ LANGUAGE plpgsql;

-- Migrar datos existentes
UPDATE public.fuentes_pago
SET entidad_financiera_id = map_entidad_to_id(entidad)
WHERE entidad IS NOT NULL
  AND entidad != ''
  AND entidad_financiera_id IS NULL;

-- Limpiar función helper
DROP FUNCTION IF EXISTS map_entidad_to_id(TEXT);

-- =====================================================
-- PASO 3: Crear vista con backward compatibility
-- =====================================================

-- Vista que mantiene compatibilidad con código existente
CREATE OR REPLACE VIEW fuentes_pago_con_entidad AS
SELECT
  fp.*,
  ef.nombre AS entidad_nombre,
  ef.tipo AS entidad_tipo,
  ef.codigo AS entidad_codigo,
  -- Mantener campo 'entidad' para backward compatibility
  COALESCE(ef.nombre, fp.entidad) AS entidad_display
FROM fuentes_pago fp
LEFT JOIN entidades_financieras ef ON fp.entidad_financiera_id = ef.id;

-- =====================================================
-- PASO 4: Comentarios y documentación
-- =====================================================

COMMENT ON COLUMN public.fuentes_pago.entidad_financiera_id IS 'FK a entidades_financieras (reemplaza campo text entidad)';
COMMENT ON COLUMN public.fuentes_pago.entidad IS 'DEPRECATED: Usar entidad_financiera_id. Mantener por backward compatibility temporal';
COMMENT ON VIEW fuentes_pago_con_entidad IS 'Vista con JOIN a entidades_financieras. Usar para queries que necesitan datos de entidad';

-- =====================================================
-- PASO 5: Trigger para sincronizar entidad (opcional)
-- =====================================================

-- Trigger para mantener sincronizado campo 'entidad' cuando se actualiza FK
CREATE OR REPLACE FUNCTION sync_entidad_from_fk()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entidad_financiera_id IS NOT NULL THEN
    -- Actualizar campo text con nombre de entidad
    SELECT nombre INTO NEW.entidad
    FROM entidades_financieras
    WHERE id = NEW.entidad_financiera_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fuentes_pago_sync_entidad
  BEFORE INSERT OR UPDATE OF entidad_financiera_id ON public.fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION sync_entidad_from_fk();

-- =====================================================
-- REPORTE: Mostrar migración
-- =====================================================

DO $$
DECLARE
  total_fuentes INTEGER;
  con_entidad_text INTEGER;
  migradas INTEGER;
  sin_match INTEGER;
  rec RECORD;
BEGIN
  -- Contar totales
  SELECT COUNT(*) INTO total_fuentes FROM fuentes_pago;
  SELECT COUNT(*) INTO con_entidad_text FROM fuentes_pago WHERE entidad IS NOT NULL AND entidad != '';
  SELECT COUNT(*) INTO migradas FROM fuentes_pago WHERE entidad_financiera_id IS NOT NULL;
  SELECT COUNT(*) INTO sin_match FROM fuentes_pago WHERE entidad IS NOT NULL AND entidad != '' AND entidad_financiera_id IS NULL;

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '   📊 REPORTE DE MIGRACIÓN';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total fuentes de pago: %', total_fuentes;
  RAISE NOTICE 'Con entidad (text): %', con_entidad_text;
  RAISE NOTICE 'Migradas a FK: %', migradas;
  RAISE NOTICE 'Sin match (revisar): %', sin_match;
  RAISE NOTICE '============================================';
  RAISE NOTICE '';

  -- Mostrar entidades sin match
  IF sin_match > 0 THEN
    RAISE NOTICE '⚠️  Entidades sin match:';
    FOR rec IN (
      SELECT DISTINCT entidad
      FROM fuentes_pago
      WHERE entidad IS NOT NULL
        AND entidad != ''
        AND entidad_financiera_id IS NULL
      LIMIT 10
    ) LOOP
      RAISE NOTICE '   - %', rec.entidad;
    END LOOP;
  END IF;
END $$;
