-- =====================================================
-- Función: actualizar_ultimo_acceso_si_necesario
-- Actualiza usuarios.ultimo_acceso SOLO si han pasado
-- más de 60 minutos desde el último registro.
-- Llamada desde el middleware de Next.js en cada request
-- autenticada, sin sobrecargar la BD.
-- =====================================================

CREATE OR REPLACE FUNCTION public.actualizar_ultimo_acceso_si_necesario(
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.usuarios
  SET ultimo_acceso = NOW()
  WHERE id = p_user_id
    AND (
      ultimo_acceso IS NULL
      OR ultimo_acceso < NOW() - INTERVAL '60 minutes'
    );
END;
$$;
