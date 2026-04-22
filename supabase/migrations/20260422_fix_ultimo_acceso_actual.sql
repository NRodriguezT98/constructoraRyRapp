-- Actualizar ultimo_acceso de todos los usuarios que tienen sesión activa ahora
-- (corrección puntual — el trigger se encargará de los logins futuros)
UPDATE public.usuarios u
SET ultimo_acceso = NOW()
WHERE EXISTS (
  SELECT 1 FROM auth.sessions s
  WHERE s.user_id = u.id
    AND s.not_after > NOW()
);
