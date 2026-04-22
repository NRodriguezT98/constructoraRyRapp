-- =====================================================
-- MIGRACIÓN: Agregar columna ultimo_login a usuarios
-- Fecha: 2026-04-22
-- Distinción:
--   ultimo_acceso = última vez que usó la app (middleware throttleado)
--   ultimo_login  = última vez que ingresó con contraseña (trigger en auth.sessions INSERT)
-- =====================================================

-- 1. Agregar columna ultimo_login a la tabla usuarios
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMPTZ;

-- 2. Poblar ultimo_login con el dato real de auth.users (last_sign_in_at)
UPDATE public.usuarios u
SET ultimo_login = au.last_sign_in_at
FROM auth.users au
WHERE au.id = u.id
  AND au.last_sign_in_at IS NOT NULL;

-- 3. Actualizar el trigger de login para guardar también en ultimo_login
CREATE OR REPLACE FUNCTION public.handle_user_sign_in()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.usuarios
  SET
    ultimo_acceso = NOW(),
    ultimo_login  = NOW()   -- Login con contraseña = también actualiza último acceso
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- 4. Trigger en UPDATE de sesión actualiza SOLO ultimo_acceso (refresh de token, no es login)
CREATE OR REPLACE FUNCTION public.handle_session_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.usuarios
  SET ultimo_acceso = NOW()
  WHERE id = NEW.user_id
    AND (ultimo_acceso IS NULL OR ultimo_acceso < NOW() - INTERVAL '60 minutes');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_session_refresh ON auth.sessions;
CREATE TRIGGER on_auth_session_refresh
  AFTER UPDATE ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_session_refresh();

-- 5. Recrear vista incluyendo ultimo_login
DROP VIEW IF EXISTS vista_usuarios_completos;

CREATE VIEW vista_usuarios_completos AS
SELECT
  u.id,
  u.email,
  u.nombres,
  u.apellidos,
  (u.nombres || ' ' || u.apellidos) AS nombre_completo,
  u.telefono,
  u.rol,
  u.estado,
  u.avatar_url,
  u.ultimo_acceso,
  u.ultimo_login,
  u.debe_cambiar_password,
  u.intentos_fallidos,
  u.bloqueado_hasta,
  u.fecha_creacion,
  u.fecha_actualizacion,
  (creator.nombres || ' ' || creator.apellidos) AS creado_por_nombre,
  au.created_at AS fecha_registro_auth,
  au.last_sign_in_at AS ultimo_login_auth
FROM usuarios u
LEFT JOIN usuarios creator ON creator.id = u.creado_por
LEFT JOIN auth.users au ON au.id = u.id;

GRANT SELECT ON vista_usuarios_completos TO authenticated;
