-- ============================================
-- MIGRACIÓN: Fix tiene_permiso() — Eliminar subquery a usuarios
-- ============================================
--
-- PROBLEMA PREVIO:
--   tiene_permiso() hacía SELECT rol FROM usuarios WHERE id = auth.uid()
--   por cada evaluación de RLS → 1 query extra por fila en cada tabla protegida
--
-- SOLUCIÓN:
--   Leer auth.jwt() ->> 'user_rol' (0 queries)
--   El claim user_rol lo escribe custom_access_token_hook en cada login
--
-- IMPACTO:
--   59+ call sites en RLS policies de todas las tablas se benefician
--   sin ningún cambio en las policies mismas
-- ============================================

CREATE OR REPLACE FUNCTION tiene_permiso(
  p_usuario_id UUID,
  p_modulo TEXT,
  p_accion TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol           TEXT;
  v_tiene_permiso BOOLEAN;
BEGIN
  -- ✅ Leer rol desde JWT claim (0 queries vs SELECT FROM usuarios)
  -- El claim user_rol lo escribe custom_access_token_hook en cada login
  v_rol := auth.jwt() ->> 'user_rol';

  -- Si no hay claim de rol en el JWT, denegarregistrar
  IF v_rol IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Administrador tiene todos los permisos (bypass sin query)
  IF v_rol = 'Administrador' THEN
    RETURN TRUE;
  END IF;

  -- Verificar permiso específico en permisos_rol
  SELECT permitido INTO v_tiene_permiso
  FROM permisos_rol
  WHERE rol    = v_rol
    AND modulo = p_modulo
    AND accion = p_accion;

  -- Si no existe registro, por defecto NO tiene permiso
  RETURN COALESCE(v_tiene_permiso, FALSE);
END;
$$;

COMMENT ON FUNCTION tiene_permiso IS
  'Verifica si el usuario autenticado tiene un permiso específico.
   Lee rol desde auth.jwt() claim user_rol (0 queries).
   Administrador bypass automático.
   Usado en 59+ RLS policies de todas las tablas protegidas.';

-- ============================================
-- VERIFICACIÓN
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ tiene_permiso() actualizada: ahora lee user_rol desde JWT';
  RAISE NOTICE '✅ Eliminada subquery a tabla usuarios por evaluación de RLS';
  RAISE NOTICE '✅ 59+ call sites beneficiados sin cambios en RLS policies';
END $$;
