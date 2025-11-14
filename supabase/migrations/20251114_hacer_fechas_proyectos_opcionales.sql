-- Migración: Hacer campos de fecha opcionales en tabla proyectos
-- Fecha: 2025-11-14
-- Descripción: Las fechas de inicio y fin estimada no son obligatorias

-- Modificar columnas para permitir NULL
ALTER TABLE proyectos
  ALTER COLUMN fecha_inicio DROP NOT NULL,
  ALTER COLUMN fecha_fin_estimada DROP NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN proyectos.fecha_inicio IS 'Fecha de inicio del proyecto (opcional)';
COMMENT ON COLUMN proyectos.fecha_fin_estimada IS 'Fecha estimada de finalización del proyecto (opcional)';
