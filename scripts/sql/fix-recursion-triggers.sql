-- ============================================================
-- FIX: Prevenir recursión infinita en triggers de compactación
-- ============================================================
-- Problema: trigger_compactar_despues_update llama compactar_orden_requisitos()
-- que hace UPDATE en la misma tabla, disparando el trigger de nuevo → bucle infinito → 500
--
-- Solución: Usar pg_trigger_depth() > 1 para salir si ya estamos dentro de un trigger
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_compactar_despues_update()
RETURNS TRIGGER AS $$
DECLARE
  fuente TEXT;
  fuentes_afectadas TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- ✅ ANTI-RECURSIÓN: Si ya estamos dentro de un trigger (nivel > 1), salir
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  /**
   * Trigger que se ejecuta DESPUÉS de actualizar un requisito.
   *
   * Casos que requieren compactación:
   * 1. Cambió el alcance (ESPECIFICO → COMPARTIDO o viceversa)
   * 2. Cambió el tipo_fuente
   * 3. Cambió fuentes_aplicables
   * 4. Cambió activo (activar/desactivar)
   */

  -- Detectar fuentes afectadas en OLD
  IF OLD.alcance = 'COMPARTIDO_CLIENTE' AND OLD.fuentes_aplicables IS NOT NULL THEN
    fuentes_afectadas := OLD.fuentes_aplicables;
  ELSIF OLD.tipo_fuente IS NOT NULL THEN
    fuentes_afectadas := ARRAY[OLD.tipo_fuente];
  END IF;

  -- Detectar fuentes afectadas en NEW
  IF NEW.alcance = 'COMPARTIDO_CLIENTE' AND NEW.fuentes_aplicables IS NOT NULL THEN
    fuentes_afectadas := fuentes_afectadas || NEW.fuentes_aplicables;
  ELSIF NEW.tipo_fuente IS NOT NULL THEN
    fuentes_afectadas := fuentes_afectadas || ARRAY[NEW.tipo_fuente];
  END IF;

  -- Compactar todas las fuentes afectadas (sin duplicados)
  FOREACH fuente IN ARRAY (SELECT ARRAY(SELECT DISTINCT unnest(fuentes_afectadas))) LOOP
    PERFORM compactar_orden_requisitos(fuente);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_compactar_despues_insert()
RETURNS TRIGGER AS $$
DECLARE
  fuente TEXT;
BEGIN
  -- ✅ ANTI-RECURSIÓN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  /**
   * Trigger que se ejecuta DESPUÉS de insertar un nuevo requisito.
   *
   * Casos:
   * 1. Requisito ESPECÍFICO → Compacta solo esa fuente
   * 2. Requisito COMPARTIDO → Compacta TODAS las fuentes aplicables
   */

  IF NEW.alcance = 'COMPARTIDO_CLIENTE' AND NEW.fuentes_aplicables IS NOT NULL THEN
    FOREACH fuente IN ARRAY NEW.fuentes_aplicables LOOP
      PERFORM compactar_orden_requisitos(fuente);
    END LOOP;
    RAISE NOTICE 'Requisito compartido creado (%) - Compactadas % fuentes',
      NEW.titulo,
      array_length(NEW.fuentes_aplicables, 1);
  ELSE
    PERFORM compactar_orden_requisitos(NEW.tipo_fuente);
    RAISE NOTICE 'Requisito específico creado (%) - Compactada fuente: %',
      NEW.titulo,
      NEW.tipo_fuente;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_compactar_despues_delete()
RETURNS TRIGGER AS $$
DECLARE
  fuente TEXT;
BEGIN
  -- ✅ ANTI-RECURSIÓN
  IF pg_trigger_depth() > 1 THEN
    RETURN OLD;
  END IF;

  /**
   * Trigger que se ejecuta DESPUÉS de eliminar un requisito.
   * Compacta el orden para evitar huecos.
   */

  IF OLD.alcance = 'COMPARTIDO_CLIENTE' AND OLD.fuentes_aplicables IS NOT NULL THEN
    FOREACH fuente IN ARRAY OLD.fuentes_aplicables LOOP
      PERFORM compactar_orden_requisitos(fuente);
    END LOOP;
  ELSE
    PERFORM compactar_orden_requisitos(OLD.tipo_fuente);
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- Verificación: probar que el PATCH ya no falla
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE requisitos_fuentes_pago_config
SET fecha_actualizacion = NOW()
WHERE id = '1f351679-f0b9-4c6e-b818-db20cc869f83'
RETURNING id, titulo;
