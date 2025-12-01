-- ============================================
-- MIGRACIÓN: Agregar campos específicos para subsidios en fuentes_pago
-- ============================================
-- Fecha: 2025-11-26
-- Descripción: Agrega campos para "Subsidio Mi Casa Ya" y "Subsidio Caja Compensación"
--
-- SUBSIDIO MI CASA YA:
-- - fecha_resolucion (opcional)
--
-- SUBSIDIO CAJA COMPENSACIÓN:
-- - fecha_acta (obligatorio)
--
-- NOTA: El campo "numero_referencia" existente será usado como:
--   - "Número de Resolución" para Subsidio Mi Casa Ya
--   - "Número de Acta" para Subsidio Caja Compensación
-- ============================================

BEGIN;

-- ============================================
-- 1. Agregar columna fecha_resolucion (para Subsidio Mi Casa Ya)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'fuentes_pago'
        AND column_name = 'fecha_resolucion'
    ) THEN
        ALTER TABLE public.fuentes_pago
        ADD COLUMN fecha_resolucion DATE NULL;

        RAISE NOTICE '✅ Columna fecha_resolucion agregada a fuentes_pago';
    ELSE
        RAISE NOTICE 'ℹ️  Columna fecha_resolucion ya existe en fuentes_pago';
    END IF;
END $$;

-- ============================================
-- 2. Agregar columna fecha_acta (para Subsidio Caja Compensación)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'fuentes_pago'
        AND column_name = 'fecha_acta'
    ) THEN
        ALTER TABLE public.fuentes_pago
        ADD COLUMN fecha_acta DATE NULL;

        RAISE NOTICE '✅ Columna fecha_acta agregada a fuentes_pago';
    ELSE
        RAISE NOTICE 'ℹ️  Columna fecha_acta ya existe en fuentes_pago';
    END IF;
END $$;

-- ============================================
-- 3. Comentarios de documentación
-- ============================================
COMMENT ON COLUMN public.fuentes_pago.fecha_resolucion IS
'Fecha de resolución de asignación del subsidio Mi Casa Ya. Opcional porque puede estar en proceso de aprobación.';

COMMENT ON COLUMN public.fuentes_pago.fecha_acta IS
'Fecha del acta de asignación para Subsidio Caja Compensación. Es obligatorio cuando se usa esta fuente de pago.';

COMMENT ON COLUMN public.fuentes_pago.numero_referencia IS
'Número de referencia variable según tipo:
- Crédito Hipotecario: Radicado/Número de Crédito
- Subsidio Mi Casa Ya: Número de Resolución (opcional)
- Subsidio Caja Compensación: Número de Acta (obligatorio)';

-- ============================================
-- 4. Crear índice para consultas por fecha (opcional, mejora performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_fuentes_pago_fecha_resolucion
ON public.fuentes_pago(fecha_resolucion)
WHERE fecha_resolucion IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fuentes_pago_fecha_acta
ON public.fuentes_pago(fecha_acta)
WHERE fecha_acta IS NOT NULL;

COMMIT;

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================
DO $$
DECLARE
    v_count_resolucion INTEGER;
    v_count_acta INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count_resolucion
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'fuentes_pago'
    AND column_name = 'fecha_resolucion';

    SELECT COUNT(*) INTO v_count_acta
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'fuentes_pago'
    AND column_name = 'fecha_acta';

    IF v_count_resolucion = 1 AND v_count_acta = 1 THEN
        RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
        RAISE NOTICE '   - fecha_resolucion: OK';
        RAISE NOTICE '   - fecha_acta: OK';
    ELSE
        RAISE EXCEPTION '❌ ERROR: Falta alguna columna';
    END IF;
END $$;
