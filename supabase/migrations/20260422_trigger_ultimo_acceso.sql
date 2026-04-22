-- =====================================================
-- MIGRACIÓN: Trigger para actualizar ultimo_acceso
-- Fecha: 2026-04-22
-- Descripción: Actualiza usuarios.ultimo_acceso cada vez
--              que Supabase Auth inserta una nueva sesión
--              (evento: login exitoso).
-- =====================================================

-- Función que se ejecuta al crear una sesión en auth.sessions
CREATE OR REPLACE FUNCTION public.handle_user_sign_in()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.usuarios
  SET ultimo_acceso = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Trigger en auth.sessions → se dispara en cada login
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.sessions;

CREATE TRIGGER on_auth_user_sign_in
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_sign_in();
