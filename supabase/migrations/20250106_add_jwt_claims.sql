-- ============================================================================
-- MIGRATION: Agregar JWT Claims Personalizados
-- ============================================================================
--
-- Este script agrega un hook a Supabase Auth para incluir datos del usuario
-- en el JWT (rol, nombres, email).
--
-- BENEFICIO:
-- - Middleware ya NO necesita hacer query a DB en cada request
-- - Rol/permisos se leen directamente del JWT
-- - Ahorro de ~50 queries/min → 0 queries/min
--
-- CÓMO EJECUTAR:
-- 1. Supabase Studio → SQL Editor
-- 2. Pegar este código
-- 3. Run
-- 4. Configurar hook en Dashboard (ver instrucciones abajo)
-- ============================================================================

-- Eliminar función si existe
DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb);

-- Crear función que agrega claims al JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos de propietario de la DB
AS $$
DECLARE
  claims jsonb;
  user_rol text;
  user_nombres text;
  user_email text;
BEGIN
  -- Obtener datos del usuario desde la tabla usuarios
  SELECT rol, nombres, email
  INTO user_rol, user_nombres, user_email
  FROM public.usuarios
  WHERE id = (event->>'user_id')::uuid;

  -- Si el usuario no existe en la tabla, usar valores por defecto
  IF user_rol IS NULL THEN
    user_rol := 'Vendedor'; -- Rol por defecto seguro
    user_nombres := '';
    user_email := '';
  END IF;

  -- Agregar claims al JWT
  claims := event->'claims';

  claims := jsonb_set(claims, '{user_rol}', to_jsonb(user_rol));
  claims := jsonb_set(claims, '{user_nombres}', to_jsonb(user_nombres));
  claims := jsonb_set(claims, '{user_email}', to_jsonb(user_email));

  -- Retornar evento modificado
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- ============================================================================
-- PASO 2: Configurar Hook en Supabase Dashboard
-- ============================================================================
--
-- 1. Ve a: Supabase Dashboard → Authentication → Hooks
-- 2. En "Generate Access Token (JWT)" hook:
--    - Click en "Create a new hook"
--    - Selecciona: "Generate Access Token (JWT)"
--    - PostgreSQL Function: public.custom_access_token_hook
--    - Enabled: ✅
-- 3. Save
--
-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
--
-- Para verificar que funciona:
--
-- 1. Haz login en la app
-- 2. En el cliente (browser console), ejecuta:
--
--    const { data } = await supabase.auth.getUser()
--    console.log(data.user.app_metadata)
--
-- Deberías ver:
--    {
--      user_rol: "Administrador",
--      user_nombres: "Juan Pérez",
--      user_email: "juan@example.com"
--    }
--
-- ============================================================================
-- IMPORTANTE: Actualizar JWT de Usuarios Existentes
-- ============================================================================
--
-- Los usuarios que ya están logueados NO verán los cambios hasta que:
-- 1. Cierren sesión y vuelvan a hacer login (RECOMENDADO)
-- 2. O su token expire (por defecto 60 minutos)
--
-- Para forzar logout de todos los usuarios (CUIDADO, solo en desarrollo):
--
-- DELETE FROM auth.sessions;
--
-- ============================================================================
