-- ============================================================
-- MIGRACIÓN: Mejoras de rendimiento y robustez del sistema RBAC
-- Fecha: 2026-04-23
--
-- Resuelve 3 problemas identificados en auditoría de permisos:
--
-- FIX 1 — JWT hook incluye permisos_cache
--   El hook custom_access_token_hook ahora escribe los permisos del
--   usuario en el JWT como array de strings "modulo.accion".
--   El middleware puede leerlos en 0ms sin query a la BD.
--
-- FIX 2 — RLS policy permisos_rol usa jwt() en lugar de subquery
--   La SELECT policy antes hacía una subquery a `usuarios` en cada
--   lectura. Ahora lee el claim user_rol del JWT (0 queries extra).
--
-- FIX 3 — RPC batch para actualizar múltiples permisos
--   Reemplaza N UPDATE individuales con una función SECURITY DEFINER
--   que procesa un array de cambios en una sola transacción.
-- ============================================================

BEGIN;

-- ============================================================
-- FIX 1: Actualizar custom_access_token_hook con permisos_cache
-- ============================================================
-- SECURITY DEFINER: corre como owner para leer permisos_rol.
-- SET search_path: previene search_path hijacking attacks.
-- ============================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims         jsonb;
  v_user_rol     text;
  v_user_nombres text;
  v_user_email   text;
  v_permisos     text[];
BEGIN
  -- Obtener datos del usuario desde la tabla usuarios
  SELECT rol, nombres, email
  INTO v_user_rol, v_user_nombres, v_user_email
  FROM public.usuarios
  WHERE id = (event->>'user_id')::uuid;

  -- Si el usuario no existe en la tabla, usar valores por defecto seguros
  IF v_user_rol IS NULL THEN
    v_user_rol     := 'Administrador de Obra'; -- Rol mínimo seguro por defecto
    v_user_nombres := '';
    v_user_email   := '';
  END IF;

  -- Para Administrador: usar wildcard (bypass total, sin enumerar permisos)
  IF v_user_rol = 'Administrador' THEN
    v_permisos := ARRAY['*.*'];
  ELSE
    -- Para otros roles: leer permisos activos y serializar como "modulo.accion"
    SELECT ARRAY_AGG(modulo || '.' || accion ORDER BY modulo, accion)
    INTO v_permisos
    FROM public.permisos_rol
    WHERE rol      = v_user_rol
      AND permitido = true;

    -- Si no tiene ningún permiso, asignar array vacío (acceso denegado por defecto)
    v_permisos := COALESCE(v_permisos, ARRAY[]::text[]);
  END IF;

  -- Construir claims del JWT
  claims := event->'claims';

  claims := jsonb_set(claims, '{user_rol}',      to_jsonb(v_user_rol));
  claims := jsonb_set(claims, '{user_nombres}',  to_jsonb(v_user_nombres));
  claims := jsonb_set(claims, '{user_email}',    to_jsonb(v_user_email));
  claims := jsonb_set(claims, '{user_permisos}', to_jsonb(v_permisos));

  -- Retornar evento modificado con nuevos claims
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- Garantizar que el rol anon/authenticated no ejecute el hook directamente
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

-- ============================================================
-- FIX 2: RLS policy permisos_rol usa jwt() claim (sin subquery)
-- ============================================================
-- Antes: SELECT u.rol FROM usuarios WHERE u.id = auth.uid()
--        → 1 query extra por cada lectura de permisos_rol
-- Ahora: auth.jwt() ->> 'user_rol'
--        → Lee del JWT que ya está en memoria (0 queries)
-- ============================================================

-- Eliminar policy anterior
DROP POLICY IF EXISTS "Usuarios pueden ver permisos de su rol" ON permisos_rol;

-- Recrear con jwt() claim
CREATE POLICY "Usuarios pueden ver permisos de su rol"
  ON permisos_rol
  FOR SELECT
  TO authenticated
  USING (
    rol = (auth.jwt() ->> 'user_rol')
  );

-- Mantener la policy de modificación (admins) — no cambia
-- "Solo administradores pueden modificar permisos" ya usa EXISTS en tabla usuarios,
-- lo cual es correcto para UPDATE/DELETE (doble verificación intencional).

-- ============================================================
-- FIX 3: RPC para actualizar múltiples permisos en batch
-- ============================================================
-- Reemplaza N UPDATEs individuales en Promise.all por una sola
-- transacción que procesa todos los cambios atomicamente.
--
-- Parámetro: p_cambios → array de objetos [{id, permitido}, ...]
-- Seguridad: SECURITY DEFINER + verifica que el caller sea Admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.actualizar_permisos_batch(
  p_cambios jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_rol text;
  v_cambio   jsonb;
  v_id       uuid;
  v_permitido boolean;
BEGIN
  -- Verificar que el usuario que llama es Administrador activo
  SELECT rol INTO v_user_rol
  FROM public.usuarios
  WHERE id = auth.uid() AND estado = 'Activo';

  IF v_user_rol IS DISTINCT FROM 'Administrador' THEN
    RAISE EXCEPTION 'Solo el Administrador puede modificar permisos'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Procesar cada cambio dentro de la misma transacción
  FOR v_cambio IN SELECT * FROM jsonb_array_elements(p_cambios)
  LOOP
    v_id       := (v_cambio->>'id')::uuid;
    v_permitido := (v_cambio->>'permitido')::boolean;

    UPDATE public.permisos_rol
    SET
      permitido       = v_permitido,
      actualizado_en  = NOW(),
      actualizado_por = auth.uid()
    WHERE id = v_id;

    -- Si no encontró la fila, lanzar error explícito
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Permiso con id % no encontrado', v_id
        USING ERRCODE = 'no_data_found';
    END IF;
  END LOOP;
END;
$$;

-- Solo el rol authenticated puede invocar el RPC (la función verifica internamente que sea Admin)
REVOKE EXECUTE ON FUNCTION public.actualizar_permisos_batch(jsonb) FROM anon;
GRANT  EXECUTE ON FUNCTION public.actualizar_permisos_batch(jsonb) TO authenticated;

COMMIT;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '✅ FIX 1: custom_access_token_hook actualizado con user_permisos';
  RAISE NOTICE '✅ FIX 2: RLS permisos_rol usa auth.jwt() ->> user_rol (0 subqueries)';
  RAISE NOTICE '✅ FIX 3: RPC actualizar_permisos_batch creado';
  RAISE NOTICE '';
  RAISE NOTICE 'ACCIÓN REQUERIDA: Los tokens JWT existentes NO incluyen user_permisos';
  RAISE NOTICE 'hasta que el usuario vuelva a hacer login (o el token expire ~60 min).';
  RAISE NOTICE 'El middleware tiene fallback a BD, así que no hay downtime.';
END;
$$;
