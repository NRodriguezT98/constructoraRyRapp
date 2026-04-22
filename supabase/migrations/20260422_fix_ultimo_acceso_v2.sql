-- Actualizar ultimo_acceso de todos los usuarios activos
-- (corrección directa sin depender de auth.sessions)
UPDATE public.usuarios
SET ultimo_acceso = NOW()
WHERE estado = 'Activo';
