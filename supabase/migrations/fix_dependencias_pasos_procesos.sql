-- =====================================================
-- FIX: Mapear dependencias de IDs de plantilla a UUIDs reales
-- =====================================================
-- Problema: Los pasos tienen dependencias con IDs de plantilla
-- (ejemplo: "paso_01", "paso_02") que no existen en las instancias.
-- Solución: Mapear por orden del paso dentro de cada negociación.
-- =====================================================

-- Función para actualizar dependencias de pasos existentes
CREATE OR REPLACE FUNCTION fix_dependencias_procesos()
RETURNS void AS $$
DECLARE
  negociacion_rec RECORD;
  paso_rec RECORD;
  paso_dep_rec RECORD;
  dependencias_reales UUID[];
  id_dependencia_real UUID;
BEGIN
  -- Iterar por cada negociación
  FOR negociacion_rec IN
    SELECT DISTINCT negociacion_id
    FROM procesos_negociacion
  LOOP
    RAISE NOTICE '🔄 Procesando negociación: %', negociacion_rec.negociacion_id;

    -- Iterar por cada paso de esta negociación que tenga dependencias
    FOR paso_rec IN
      SELECT *
      FROM procesos_negociacion
      WHERE negociacion_id = negociacion_rec.negociacion_id
        AND depende_de IS NOT NULL
        AND array_length(depende_de, 1) > 0
      ORDER BY orden
    LOOP
      dependencias_reales := ARRAY[]::UUID[];

      RAISE NOTICE '  📌 Paso: % (orden %)', paso_rec.nombre, paso_rec.orden;
      RAISE NOTICE '     Dependencias actuales: %', paso_rec.depende_de;

      -- Por cada dependencia en el array
      FOR i IN 1..array_length(paso_rec.depende_de, 1)
      LOOP
        -- Obtener el ID que está en depende_de
        -- Si no es un UUID válido, asumir que es por orden

        -- Intentar buscar por ID directo primero
        SELECT id INTO id_dependencia_real
        FROM procesos_negociacion
        WHERE negociacion_id = negociacion_rec.negociacion_id
          AND id = paso_rec.depende_de[i]::UUID;

        -- Si no se encontró, buscar por orden (asumir que depende de pasos anteriores)
        IF id_dependencia_real IS NULL THEN
          -- Buscar paso que tenga orden menor al actual
          SELECT id INTO id_dependencia_real
          FROM procesos_negociacion
          WHERE negociacion_id = negociacion_rec.negociacion_id
            AND orden < paso_rec.orden
          ORDER BY orden DESC
          LIMIT 1 OFFSET (i - 1); -- Tomar el paso i-ésimo anterior
        END IF;

        IF id_dependencia_real IS NOT NULL THEN
          dependencias_reales := array_append(dependencias_reales, id_dependencia_real);
          RAISE NOTICE '     ✓ Dependencia mapeada: %', id_dependencia_real;
        END IF;
      END LOOP;

      -- Actualizar el paso con las dependencias reales
      IF array_length(dependencias_reales, 1) > 0 THEN
        UPDATE procesos_negociacion
        SET depende_de = dependencias_reales
        WHERE id = paso_rec.id;

        RAISE NOTICE '     ✅ Dependencias actualizadas: %', dependencias_reales;
      ELSE
        -- Si no se encontraron dependencias válidas, limpiar el array
        UPDATE procesos_negociacion
        SET depende_de = NULL
        WHERE id = paso_rec.id;

        RAISE NOTICE '     ⚠️ No se encontraron dependencias válidas, limpiado';
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE '✅ Proceso de mapeo completado';
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función
SELECT fix_dependencias_procesos();

-- Eliminar la función temporal
DROP FUNCTION IF EXISTS fix_dependencias_procesos();

-- Verificación: Mostrar pasos con dependencias
SELECT
  pn.id,
  pn.negociacion_id,
  pn.orden,
  pn.nombre,
  pn.depende_de,
  (
    SELECT string_agg(orden || '. ' || nombre, ', ')
    FROM procesos_negociacion pn2
    WHERE pn2.id = ANY(pn.depende_de)
  ) as "dependencias_nombres"
FROM procesos_negociacion pn
WHERE pn.depende_de IS NOT NULL
  AND array_length(pn.depende_de, 1) > 0
ORDER BY pn.negociacion_id, pn.orden;
