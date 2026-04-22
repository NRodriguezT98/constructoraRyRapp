-- =====================================================
-- ACTUALIZACIÓN: Trigger también dispara en UPDATE de sesión
-- (cubre refresh de token, no solo login inicial)
-- =====================================================

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

-- Trigger INSERT (login inicial)
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.sessions;
CREATE TRIGGER on_auth_user_sign_in
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_sign_in();

-- Trigger UPDATE (refresh de token = usuario sigue activo)
DROP TRIGGER IF EXISTS on_auth_session_refresh ON auth.sessions;
CREATE TRIGGER on_auth_session_refresh
  AFTER UPDATE ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_sign_in();
