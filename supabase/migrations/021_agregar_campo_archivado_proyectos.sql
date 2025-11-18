-- ============================================
-- Migration: Agregar sistema de archivado a proyectos
-- Fecha: 2025-11-17
-- Descripción: Permite archivar proyectos en lugar de eliminarlos
-- ============================================

-- 1. Agregar columnas para sistema de archivado
ALTER TABLE public.proyectos
ADD COLUMN IF NOT EXISTS archivado BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_archivado TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS motivo_archivo TEXT;

-- 2. Crear índice para optimizar consultas de proyectos activos/archivados
CREATE INDEX IF NOT EXISTS idx_proyectos_archivado ON public.proyectos(archivado);

-- 3. Comentarios para documentación
COMMENT ON COLUMN public.proyectos.archivado IS 'Indica si el proyecto está archivado (soft delete)';
COMMENT ON COLUMN public.proyectos.fecha_archivado IS 'Fecha y hora en que se archivó el proyecto';
COMMENT ON COLUMN public.proyectos.motivo_archivo IS 'Motivo opcional por el cual se archivó el proyecto';

-- 4. Verificación
DO $$
BEGIN
    -- Mostrar resumen de la migración
    RAISE NOTICE '✅ Migración completada: Sistema de archivado agregado a tabla proyectos';
    RAISE NOTICE '📊 Campos agregados: archivado (boolean), fecha_archivado (timestamp), motivo_archivo (text)';
    RAISE NOTICE '🔍 Índice creado: idx_proyectos_archivado';
END $$;
