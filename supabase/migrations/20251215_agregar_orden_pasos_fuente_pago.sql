-- ================================================================
-- MIGRACIÓN: Agregar campo orden a pasos_fuente_pago
-- ================================================================
-- Fecha: 2025-12-15
-- Descripción: Agregar campo orden para mantener el orden de
--              visualización de los requisitos según la configuración
-- ================================================================

-- Agregar columna orden
ALTER TABLE public.pasos_fuente_pago
ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;

-- Crear índice para performance
CREATE INDEX IF NOT EXISTS idx_pasos_fuente_pago_orden
  ON public.pasos_fuente_pago(fuente_pago_id, orden);

-- Comentario
COMMENT ON COLUMN public.pasos_fuente_pago.orden IS
  'Orden de visualización del paso según configuración de requisitos (1, 2, 3...)';

-- ================================================================
-- Actualizar orden de pasos existentes basado en metadata
-- ================================================================

-- Crédito Hipotecario
UPDATE public.pasos_fuente_pago
SET orden = CASE
  WHEN paso = 'carta_aprobacion_credito' THEN 1
  WHEN paso = 'boleta_registro' THEN 2
  WHEN paso = 'solicitud_desembolso' THEN 3
  ELSE 999
END
WHERE fuente_pago_id IN (
  SELECT id FROM public.fuentes_pago WHERE tipo = 'Crédito Hipotecario'
);

-- Subsidio Mi Casa Ya
UPDATE public.pasos_fuente_pago
SET orden = CASE
  WHEN paso = 'carta_asignacion' THEN 1
  WHEN paso = 'escritura_firmada' THEN 2
  WHEN paso = 'boleta_registro' THEN 3
  WHEN paso = 'solicitud_desembolso' THEN 4
  ELSE 999
END
WHERE fuente_pago_id IN (
  SELECT id FROM public.fuentes_pago WHERE tipo = 'Subsidio Mi Casa Ya'
);

-- Subsidio Caja de Compensación
UPDATE public.pasos_fuente_pago
SET orden = CASE
  WHEN paso = 'carta_asignacion' THEN 1
  WHEN paso = 'escritura_firmada' THEN 2
  WHEN paso = 'boleta_registro' THEN 3
  WHEN paso = 'solicitud_desembolso' THEN 4
  ELSE 999
END
WHERE fuente_pago_id IN (
  SELECT id FROM public.fuentes_pago
  WHERE tipo IN ('Subsidio Caja de Compensación', 'Subsidio Caja Compensación')
);

-- Verificar resultado
DO $$
DECLARE
  total_actualizados INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_actualizados
  FROM public.pasos_fuente_pago
  WHERE orden > 0;

  RAISE NOTICE '✅ Campo orden agregado. Pasos actualizados: %', total_actualizados;
END $$;
