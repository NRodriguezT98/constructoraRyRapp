-- ============================================
-- MIGRACIÓN 042: Renombrar roles del sistema
-- ============================================
-- Fecha: 2026-04-04
-- Descripción: Renombra roles existentes a nombres definitivos
--   Contador    → Contabilidad
--   Supervisor  → Administrador de Obra
--   Gerente     → Gerencia
--   Vendedor    → (reasignar a Contabilidad)
--
-- Roles finales: Administrador, Contabilidad, Gerencia, Administrador de Obra
-- ============================================
-- Dependencias que usan el ENUM rol_usuario:
--   1. Tabla usuarios.rol (ENUM)
--   2. Vista vista_usuarios_completos (depende de usuarios.rol)
--   3. Función handle_new_user (declara v_rol rol_usuario, default 'Vendedor')
--   4. 6 políticas RLS en usuarios y permisos_rol
--   NOTA: permisos_rol.rol ya es TEXT, no necesita ALTER
-- ============================================

BEGIN;

-- ============================================
-- PASO 1: Eliminar dependencias del ENUM
-- ============================================

-- 1a. Eliminar vista que depende de usuarios.rol
DROP VIEW IF EXISTS vista_usuarios_completos;

-- 1b. Eliminar función que referencia rol_usuario
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 1c. Eliminar políticas RLS de tabla usuarios
DROP POLICY IF EXISTS "solo_admins_pueden_actualizar_usuarios" ON usuarios;
DROP POLICY IF EXISTS "solo_admins_pueden_crear_usuarios" ON usuarios;
DROP POLICY IF EXISTS "solo_admins_pueden_eliminar_usuarios" ON usuarios;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_propio_perfil" ON usuarios;

-- 1d. Eliminar políticas RLS de tabla permisos_rol
DROP POLICY IF EXISTS "Solo administradores pueden modificar permisos" ON permisos_rol;
DROP POLICY IF EXISTS "Usuarios pueden ver permisos de su rol" ON permisos_rol;

-- ============================================
-- PASO 2: Convertir columna de ENUM a TEXT
-- ============================================
ALTER TABLE usuarios ALTER COLUMN rol TYPE TEXT;

-- Eliminar el ENUM viejo
DROP TYPE IF EXISTS rol_usuario;

-- ============================================
-- PASO 3: Renombrar roles en tabla usuarios
-- ============================================
UPDATE usuarios
SET rol = 'Contabilidad', fecha_actualizacion = NOW()
WHERE rol IN ('Contador', 'Vendedor');

UPDATE usuarios
SET rol = 'Administrador de Obra', fecha_actualizacion = NOW()
WHERE rol = 'Supervisor';

UPDATE usuarios
SET rol = 'Gerencia', fecha_actualizacion = NOW()
WHERE rol = 'Gerente';

-- ============================================
-- PASO 4: Renombrar roles en tabla permisos_rol (ya es TEXT)
-- ============================================
UPDATE permisos_rol SET rol = 'Contabilidad' WHERE rol = 'Contador';
UPDATE permisos_rol SET rol = 'Administrador de Obra' WHERE rol = 'Supervisor';
UPDATE permisos_rol SET rol = 'Gerencia' WHERE rol = 'Gerente';
DELETE FROM permisos_rol WHERE rol = 'Vendedor';

-- ============================================
-- PASO 5: Recrear ENUM con nuevos valores
-- ============================================
CREATE TYPE rol_usuario AS ENUM (
  'Administrador',
  'Contabilidad',
  'Gerencia',
  'Administrador de Obra'
);

-- ============================================
-- PASO 6: Convertir columna de TEXT de vuelta a ENUM
-- ============================================
ALTER TABLE usuarios ALTER COLUMN rol TYPE rol_usuario USING rol::rol_usuario;

-- ============================================
-- PASO 7: Recrear función handle_new_user (con nuevos roles)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_nombres VARCHAR(100);
  v_apellidos VARCHAR(100);
  v_rol rol_usuario;
BEGIN
  v_nombres := COALESCE(NEW.raw_user_meta_data->>'nombres', '');
  v_apellidos := COALESCE(NEW.raw_user_meta_data->>'apellidos', '');

  -- Default: Contabilidad (antes era Vendedor)
  v_rol := COALESCE(
    (NEW.raw_user_meta_data->>'rol')::rol_usuario,
    'Contabilidad'::rol_usuario
  );

  INSERT INTO usuarios (
    id, email, nombres, apellidos, rol, estado, debe_cambiar_password
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_nombres,
    v_apellidos,
    v_rol,
    'Activo'::estado_usuario,
    true
  );

  RETURN NEW;
END;
$function$;

-- Reasociar trigger (por si CASCADE lo eliminó)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASO 8: Recrear vista vista_usuarios_completos
-- ============================================
CREATE OR REPLACE VIEW vista_usuarios_completos AS
SELECT u.id,
    u.email,
    u.nombres,
    u.apellidos,
    (((u.nombres)::text || ' '::text) || (u.apellidos)::text) AS nombre_completo,
    u.telefono,
    u.rol,
    u.estado,
    u.avatar_url,
    u.ultimo_acceso,
    u.debe_cambiar_password,
    u.intentos_fallidos,
    u.bloqueado_hasta,
    u.fecha_creacion,
    u.fecha_actualizacion,
    (((creator.nombres)::text || ' '::text) || (creator.apellidos)::text) AS creado_por_nombre,
    au.created_at AS fecha_registro_auth,
    au.last_sign_in_at AS ultimo_login_auth
FROM ((usuarios u
    LEFT JOIN usuarios creator ON ((creator.id = u.creado_por)))
    LEFT JOIN auth.users au ON ((au.id = u.id)));

-- ============================================
-- PASO 9: Recrear políticas RLS de tabla usuarios
-- ============================================

-- Lectura: todos los usuarios autenticados (USING(true) - política de empresa pequeña)
-- Nota: la política de lectura no referencia rol, no fue eliminada

-- Actualización: solo admins
CREATE POLICY "solo_admins_pueden_actualizar_usuarios"
ON usuarios FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND u.rol = 'Administrador'::rol_usuario
    AND u.estado = 'Activo'::estado_usuario
  )
);

-- Creación: solo admins
CREATE POLICY "solo_admins_pueden_crear_usuarios"
ON usuarios FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND u.rol = 'Administrador'::rol_usuario
    AND u.estado = 'Activo'::estado_usuario
  )
);

-- Eliminación: solo admins
CREATE POLICY "solo_admins_pueden_eliminar_usuarios"
ON usuarios FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND u.rol = 'Administrador'::rol_usuario
    AND u.estado = 'Activo'::estado_usuario
  )
);

-- Actualizar propio perfil
CREATE POLICY "usuarios_pueden_actualizar_propio_perfil"
ON usuarios FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND rol = (SELECT u.rol FROM usuarios u WHERE u.id = auth.uid())
);

-- ============================================
-- PASO 10: Recrear políticas RLS de tabla permisos_rol
-- ============================================

-- Solo admins pueden modificar
CREATE POLICY "Solo administradores pueden modificar permisos"
ON permisos_rol FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND (u.rol)::text = 'Administrador'
    AND u.estado = 'Activo'::estado_usuario
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND (u.rol)::text = 'Administrador'
    AND u.estado = 'Activo'::estado_usuario
  )
);

-- Usuarios pueden ver permisos de su propio rol
CREATE POLICY "Usuarios pueden ver permisos de su rol"
ON permisos_rol FOR SELECT
USING (
  rol = (SELECT (u.rol)::text FROM usuarios u WHERE u.id = auth.uid())
);

-- ============================================
-- PASO 11: Limpiar CHECK constraints obsoletas
-- ============================================
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS chk_rol_valido;
ALTER TABLE permisos_rol DROP CONSTRAINT IF EXISTS permisos_rol_rol_check;
ALTER TABLE permisos_rol DROP CONSTRAINT IF EXISTS chk_permisos_rol_valido;

-- ============================================
-- PASO 12: Verificación final
-- ============================================
DO $$
DECLARE
  roles_invalidos INTEGER;
  total_usuarios INTEGER;
BEGIN
  SELECT COUNT(*) INTO roles_invalidos
  FROM usuarios
  WHERE rol::text NOT IN ('Administrador', 'Contabilidad', 'Gerencia', 'Administrador de Obra');

  SELECT COUNT(*) INTO total_usuarios FROM usuarios;

  IF roles_invalidos > 0 THEN
    RAISE EXCEPTION 'ERROR: Hay % usuarios con roles inválidos después de la migración', roles_invalidos;
  END IF;

  RAISE NOTICE '✅ Migración 042 completada exitosamente';
  RAISE NOTICE '✅ % usuarios con roles válidos', total_usuarios;
  RAISE NOTICE '✅ Roles disponibles: Administrador, Contabilidad, Gerencia, Administrador de Obra';
END $$;

COMMIT;
