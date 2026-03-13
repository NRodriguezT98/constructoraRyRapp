-- =====================================================
-- MIGRACIÓN: Sistema de versiones limpias por negociación
-- =====================================================
-- Fecha: 2025-12-03
-- Problema: Versiones infladas (v93 cuando debería ser v2, v3)
-- Solución: Reset de versiones al crear negociación + renumeración de existentes
-- =====================================================

-- ========================================
-- PARTE 1: Renumerar versiones existentes
-- ========================================

-- PASO 1.1: Desactivar constraint temporalmente
ALTER TABLE negociaciones_historial
  DROP CONSTRAINT IF EXISTS unique_negociacion_version;

-- PASO 1.2: Para cada negociación, renumerar sus versiones desde 1
DO $$
DECLARE
  neg_record RECORD;
  version_record RECORD;
  nuevo_num INTEGER;
  total_renumeradas INTEGER := 0;
BEGIN
  RAISE NOTICE '=== RENUMERANDO VERSIONES EXISTENTES ===';

  -- Por cada negociación
  FOR neg_record IN
    SELECT DISTINCT negociacion_id
    FROM negociaciones_historial
    ORDER BY negociacion_id
  LOOP
    nuevo_num := 0;

    -- Por cada versión de esta negociación (más antigua primero)
    FOR version_record IN
      SELECT id, version
      FROM negociaciones_historial
      WHERE negociacion_id = neg_record.negociacion_id
      ORDER BY fecha_cambio ASC, version ASC
    LOOP
      nuevo_num := nuevo_num + 1;

      -- Actualizar a nuevo número
      UPDATE negociaciones_historial
      SET version = nuevo_num
      WHERE id = version_record.id;

    END LOOP;

    -- Actualizar version_actual en negociaciones
    UPDATE negociaciones
    SET version_actual = nuevo_num
    WHERE id = neg_record.negociacion_id;

    total_renumeradas := total_renumeradas + 1;

    RAISE NOTICE 'Negociación %/... renumerada: % → % versiones',
      total_renumeradas,
      SUBSTRING(neg_record.negociacion_id::text, 1, 8),
      nuevo_num;
  END LOOP;

  RAISE NOTICE '✓ Total renumeradas: % negociaciones', total_renumeradas;
END $$;

-- PASO 1.3: Reactivar constraint
ALTER TABLE negociaciones_historial
  ADD CONSTRAINT unique_negociacion_version
  UNIQUE (negociacion_id, version);

-- ========================================
-- PARTE 2: Función para crear versión limpia
-- ========================================

CREATE OR REPLACE FUNCTION crear_nueva_version_negociacion()
RETURNS TRIGGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  -- Si es una nueva negociación, empezar en versión 1
  IF TG_OP = 'INSERT' THEN
    NEW.version_actual := 1;
    NEW.version_lock := 1;
    RETURN NEW;
  END IF;

  -- Si es UPDATE, mantener la lógica existente
  -- (el servicio incrementa version_actual manualmente)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PARTE 3: Trigger para nuevas negociaciones
-- ========================================

DROP TRIGGER IF EXISTS trigger_init_version_negociacion ON negociaciones;

CREATE TRIGGER trigger_init_version_negociacion
  BEFORE INSERT ON negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION crear_nueva_version_negociacion();

COMMENT ON FUNCTION crear_nueva_version_negociacion() IS
'Inicializa version_actual = 1 al crear nueva negociación.
Las actualizaciones se manejan manualmente desde el servicio.';

-- ========================================
-- PARTE 4: Mostrar resultados
-- ========================================

SELECT
  '=== RESUMEN POR NEGOCIACIÓN ===' as info,
  n.id,
  SUBSTRING(c.nombres || ' ' || c.apellidos, 1, 30) as cliente,
  n.version_actual as version_actual_tabla,
  (
    SELECT MAX(version)
    FROM negociaciones_historial
    WHERE negociacion_id = n.id
  ) as version_max_historial,
  (
    SELECT COUNT(*)
    FROM negociaciones_historial
    WHERE negociacion_id = n.id
  ) as total_versiones
FROM negociaciones n
LEFT JOIN clientes c ON c.id = n.cliente_id
ORDER BY n.fecha_creacion DESC
LIMIT 10;
