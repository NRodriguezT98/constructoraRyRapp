-- ================================================================
-- SCRIPT: Actualizar orden de pasos existentes según configuración
-- ================================================================
-- Fecha: 2025-12-15
-- Descripción: Sincroniza el orden de pasos_fuente_pago con
--              la configuración de requisitos_fuentes_pago_config
-- ================================================================

-- Función para actualizar el orden de pasos existentes
DO $$
DECLARE
  r RECORD;
  v_orden INTEGER;
  v_pasos_actualizados INTEGER := 0;
BEGIN
  -- Iterar sobre todos los pasos existentes
  FOR r IN
    SELECT
      pfp.id as paso_id,
      pfp.paso as paso_identificador,
      fp.tipo as tipo_fuente
    FROM public.pasos_fuente_pago pfp
    INNER JOIN public.fuentes_pago fp ON pfp.fuente_pago_id = fp.id
  LOOP
    -- Buscar el orden correcto en la configuración
    SELECT orden INTO v_orden
    FROM public.requisitos_fuentes_pago_config
    WHERE tipo_fuente = r.tipo_fuente
      AND paso_identificador = r.paso_identificador
      AND activo = true
    LIMIT 1;

    -- Si se encontró la configuración, actualizar el orden
    IF v_orden IS NOT NULL THEN
      UPDATE public.pasos_fuente_pago
      SET orden = v_orden
      WHERE id = r.paso_id;

      v_pasos_actualizados := v_pasos_actualizados + 1;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ Pasos actualizados: %', v_pasos_actualizados;
END $$;

-- Verificar resultados
SELECT
  fp.tipo as tipo_fuente,
  pfp.paso as paso_identificador,
  pfp.titulo,
  pfp.orden,
  COUNT(*) as cantidad
FROM public.pasos_fuente_pago pfp
INNER JOIN public.fuentes_pago fp ON pfp.fuente_pago_id = fp.id
GROUP BY fp.tipo, pfp.paso, pfp.titulo, pfp.orden
ORDER BY fp.tipo, pfp.orden;
