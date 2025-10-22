-- =====================================================
-- Migración: Corregir codificación UTF-8 en CHECK constraint de fuentes_pago
-- =====================================================
-- Fecha: 2025-10-21
-- Problema: El CHECK constraint tiene caracteres mal codificados:
--   - 'CrÃ©dito Hipotecario' en lugar de 'Crédito Hipotecario'
--   - 'Subsidio Caja CompensaciÃ³n' en lugar de 'Subsidio Caja Compensación'
-- Causa: Problema de encoding al crear el constraint originalmente
-- Solución: Recrear constraint con codificación UTF-8 correcta
-- =====================================================

-- PASO 1: Actualizar valores existentes (si los hay) antes de cambiar constraint
-- Esto corrige cualquier dato viejo que tenga la codificación incorrecta
UPDATE public.fuentes_pago
SET tipo = 'Crédito Hipotecario'
WHERE tipo LIKE '%Cr_dito%' OR tipo LIKE '%Credito%';

UPDATE public.fuentes_pago
SET tipo = 'Subsidio Caja Compensación'
WHERE tipo LIKE '%Compensaci_n%' OR tipo LIKE '%Compensacion%';

-- PASO 2: Eliminar constraint viejo con codificación incorrecta
ALTER TABLE public.fuentes_pago
DROP CONSTRAINT IF EXISTS fuentes_pago_tipo_check;

-- PASO 3: Crear constraint nuevo con codificación UTF-8 correcta
ALTER TABLE public.fuentes_pago
ADD CONSTRAINT fuentes_pago_tipo_check CHECK (tipo IN (
  'Cuota Inicial',
  'Crédito Hipotecario',
  'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación'
));

-- COMENTARIO: Ahora los valores tienen acentos correctos (é, ó) en lugar de (Ã©, Ã³)

-- Verificación: Ver el constraint actualizado
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.fuentes_pago'::regclass
  AND contype = 'c'
  AND conname = 'fuentes_pago_tipo_check';

-- Verificación: Ver todas las fuentes de pago existentes y sus tipos
SELECT
  tipo,
  COUNT(*) as cantidad
FROM public.fuentes_pago
GROUP BY tipo
ORDER BY tipo;
