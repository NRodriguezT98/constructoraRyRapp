-- ================================================================
-- FIX: Migrar UUIDs erróneos en campo entidad
-- ================================================================
-- Fecha: 2025-12-15
-- Descripción: Corregir fuentes que tienen UUID en campo entidad
--              en lugar de nombre, y asignar FK correcto
-- ================================================================

-- Paso 1: Identificar los UUIDs problemáticos
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM fuentes_pago
  WHERE entidad ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND entidad_financiera_id IS NULL;

  RAISE NOTICE '🔍 Registros con UUID en entidad: %', v_count;
END $$;

-- Paso 2: Intentar mapear UUIDs a entidades existentes
-- (en caso de que el UUID sea un ID válido de entidades_financieras)
UPDATE fuentes_pago fp
SET entidad_financiera_id = ef.id,
    entidad = ef.nombre  -- El trigger lo haría, pero lo hacemos explícito
FROM entidades_financieras ef
WHERE fp.entidad = ef.id::text  -- El UUID en entidad coincide con id de entidad
  AND fp.entidad_financiera_id IS NULL
  AND fp.entidad ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Paso 3: Para UUIDs que NO son entidades válidas, buscar por similitud
-- o marcar como "Entidad Desconocida"
UPDATE fuentes_pago
SET entidad = 'Entidad Desconocida (verificar manualmente)',
    entidad_financiera_id = NULL
WHERE entidad ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND entidad_financiera_id IS NULL;

-- Paso 4: Verificar resultado
DO $$
DECLARE
  v_pendientes INTEGER;
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO v_pendientes
  FROM fuentes_pago
  WHERE entidad ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

  IF v_pendientes > 0 THEN
    RAISE WARNING '⚠️ Aún quedan % registros con UUID en entidad', v_pendientes;
    FOR rec IN (
      SELECT id, tipo, entidad
      FROM fuentes_pago
      WHERE entidad ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ) LOOP
      RAISE NOTICE '   - %: % (UUID: %)', rec.tipo, rec.id, rec.entidad;
    END LOOP;
  ELSE
    RAISE NOTICE '✅ Todos los UUIDs corregidos';
  END IF;
END $$;

-- Paso 5: Mostrar estado final
SELECT
  tipo,
  COUNT(*) as total,
  COUNT(entidad_financiera_id) as "con_FK",
  COUNT(*) - COUNT(entidad_financiera_id) as "sin_FK",
  COUNT(*) FILTER (WHERE entidad ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') as "con_UUID"
FROM fuentes_pago
WHERE estado_fuente = 'activa'
GROUP BY tipo
ORDER BY tipo;
