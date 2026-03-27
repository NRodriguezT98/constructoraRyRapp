-- =====================================================
-- TRIGGER ACTUALIZADO: calcular_valor_total_pagar
-- Fecha: 2026-03-27
--
-- MEJORA: Guardia anti-doble-conteo automática.
--
-- El trigger detecta si valor_negociado = vivienda.valor_total
-- (es decir, se enviaron los gastos/recargos YA incluidos) y auto-corrige
-- a valor_base antes de calcular valor_total_pagar.
-- Esto hace el sistema resiliente a errores del frontend sin importar
-- qué valor llegue — el resultado final SIEMPRE es correcto.
--
-- FÓRMULA ESPERADA:
--   valor_negociado   = valor_base  (precio de la casa sin extras)
--   valor_total_pagar = (valor_negociado − descuento) + gastos_notariales
--                       + recargo_esquinera (si es_esquinera)
--
-- GUARDIA:
--   Si valor_negociado ≈ valor_total de la vivienda (ya incluye extras),
--   auto-corrección silenciosa a valor_base.
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_valor_total_pagar()
RETURNS TRIGGER AS $$
DECLARE
  v_gastos          DECIMAL(15,2) := 0;
  v_recargo         DECIMAL(15,2) := 0;
  v_es_esquinera    BOOLEAN       := false;
  v_valor_base      DECIMAL(15,2) := 0;
  v_valor_total_viv DECIMAL(15,2) := 0;
  v_valor_neto      DECIMAL(15,2);
BEGIN
  -- Obtener campos financieros de la vivienda vinculada
  SELECT
    COALESCE(v.gastos_notariales,  0),
    COALESCE(v.recargo_esquinera,  0),
    COALESCE(v.es_esquinera,       false),
    COALESCE(v.valor_base,         0),
    COALESCE(v.valor_total,        0)
  INTO v_gastos, v_recargo, v_es_esquinera, v_valor_base, v_valor_total_viv
  FROM public.viviendas v
  WHERE v.id = NEW.vivienda_id;

  -- ─────────────────────────────────────────────────
  -- 🛡️ GUARDIA ANTI-DOBLE-CONTEO
  -- Si el frontend envió valor_total (que ya incluye gastos+recargo)
  -- en lugar de valor_base, auto-corregir antes de sumar extras.
  --
  -- Condición de activación:
  --   ① La vivienda tiene extras (valor_base < valor_total)
  --   ② valor_negociado ≈ valor_total de la vivienda (tolerancia 1 COP)
  -- ─────────────────────────────────────────────────
  IF v_valor_base > 0
     AND v_valor_base < v_valor_total_viv
     AND ABS(COALESCE(NEW.valor_negociado, 0) - v_valor_total_viv) <= 1
  THEN
    RAISE WARNING
      '[calcular_valor_total_pagar] DOBLE CONTEO PREVENIDO: '
      'valor_negociado=% ≈ valor_total_vivienda=%. '
      'Auto-corrigiendo a valor_base=% (vivienda_id=%)',
      NEW.valor_negociado, v_valor_total_viv, v_valor_base, NEW.vivienda_id;

    NEW.valor_negociado := v_valor_base;
  END IF;

  -- Calcular neto (valor acordado menos descuento)
  v_valor_neto := COALESCE(NEW.valor_negociado, 0) - COALESCE(NEW.descuento_aplicado, 0);

  -- Calcular obligación total (incluye gastos notariales y recargo si aplica)
  IF v_es_esquinera THEN
    NEW.valor_total_pagar := v_valor_neto + v_gastos + v_recargo;
  ELSE
    NEW.valor_total_pagar := v_valor_neto + v_gastos;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear los triggers (la función ya existía, solo se actualiza el cuerpo)
DROP TRIGGER IF EXISTS trigger_calcular_valor_total_pagar_insert ON public.negociaciones;
CREATE TRIGGER trigger_calcular_valor_total_pagar_insert
  BEFORE INSERT ON public.negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_total_pagar();

DROP TRIGGER IF EXISTS trigger_calcular_valor_total_pagar_update ON public.negociaciones;
CREATE TRIGGER trigger_calcular_valor_total_pagar_update
  BEFORE UPDATE OF valor_negociado, descuento_aplicado, vivienda_id ON public.negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_total_pagar();

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger calcular_valor_total_pagar actualizado con guardia anti-doble-conteo.';
END $$;
