-- ============================================
-- MIGRACIÓN: Actualizar estados de proyectos
-- Fecha: 2025-11-13
-- Descripción: Agregar estado 'en_proceso' a la tabla proyectos
-- ============================================

-- 1. Eliminar constraint actual
ALTER TABLE public.proyectos
  DROP CONSTRAINT IF EXISTS proyectos_estado_check;

-- 2. Agregar nuevo constraint con 'en_proceso'
ALTER TABLE public.proyectos
  ADD CONSTRAINT proyectos_estado_check
  CHECK (estado IN (
    'en_planificacion',
    'en_proceso',
    'en_construccion',
    'completado',
    'pausado'
  ));

-- 3. Comentario en el constraint
COMMENT ON CONSTRAINT proyectos_estado_check ON public.proyectos IS
  'Estados permitidos: en_planificacion, en_proceso, en_construccion, completado, pausado';

-- 4. Verificar cambios
DO $$
BEGIN
  RAISE NOTICE '✅ Constraint de estados actualizado correctamente';
  RAISE NOTICE '📋 Estados permitidos: en_planificacion, en_proceso, en_construccion, completado, pausado';
END $$;
