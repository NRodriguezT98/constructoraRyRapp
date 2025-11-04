-- =====================================================
-- MIGRACIÓN: Sistema de Usuarios con Roles
-- Fecha: 2025-11-03
-- Descripción: Tabla de usuarios con perfiles extendidos,
--              roles, y trigger automático desde auth.users
-- =====================================================

-- =====================================================
-- 1. CREAR ENUM para roles
-- =====================================================

DO $$ BEGIN
  CREATE TYPE rol_usuario AS ENUM ('Administrador', 'Gerente', 'Vendedor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. CREAR ENUM para estados de usuario
-- =====================================================

DO $$ BEGIN
  CREATE TYPE estado_usuario AS ENUM ('Activo', 'Inactivo', 'Bloqueado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 3. CREAR TABLA usuarios
-- =====================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información personal
  email VARCHAR(255) NOT NULL UNIQUE,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),

  -- Rol y permisos
  rol rol_usuario NOT NULL DEFAULT 'Vendedor',
  estado estado_usuario NOT NULL DEFAULT 'Activo',

  -- Metadata
  avatar_url TEXT,
  preferencias JSONB DEFAULT '{}'::jsonb,

  -- Auditoría
  creado_por UUID REFERENCES auth.users(id),
  ultimo_acceso TIMESTAMPTZ,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Seguridad
  debe_cambiar_password BOOLEAN NOT NULL DEFAULT false,
  intentos_fallidos INTEGER NOT NULL DEFAULT 0,
  bloqueado_hasta TIMESTAMPTZ
);

-- =====================================================
-- 4. ÍNDICES
-- =====================================================

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);
CREATE INDEX idx_usuarios_creado_por ON usuarios(creado_por);

-- =====================================================
-- 5. COMENTARIOS
-- =====================================================

COMMENT ON TABLE usuarios IS
  'Perfiles extendidos de usuarios con roles y permisos';

COMMENT ON COLUMN usuarios.rol IS
  'Rol del usuario: Administrador (acceso total), Gerente (supervisión), Vendedor (operativo)';

COMMENT ON COLUMN usuarios.estado IS
  'Estado del usuario: Activo (puede acceder), Inactivo (suspendido temporalmente), Bloqueado (bloqueado por seguridad)';

COMMENT ON COLUMN usuarios.debe_cambiar_password IS
  'Flag para forzar cambio de contraseña en próximo login (usuarios nuevos o reset)';

COMMENT ON COLUMN usuarios.intentos_fallidos IS
  'Contador de intentos de login fallidos (se resetea en login exitoso)';

COMMENT ON COLUMN usuarios.bloqueado_hasta IS
  'Fecha hasta la cual el usuario está bloqueado (NULL si no está bloqueado)';

-- =====================================================
-- 6. FUNCIÓN para actualizar fecha_actualizacion
-- =====================================================

CREATE OR REPLACE FUNCTION update_usuarios_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_usuarios_fecha_actualizacion
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_usuarios_fecha_actualizacion();

-- =====================================================
-- 7. FUNCIÓN para crear usuario automáticamente
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_nombres VARCHAR(100);
  v_apellidos VARCHAR(100);
  v_rol rol_usuario;
BEGIN
  -- Extraer nombres y apellidos del metadata (si existen)
  v_nombres := COALESCE(NEW.raw_user_meta_data->>'nombres', '');
  v_apellidos := COALESCE(NEW.raw_user_meta_data->>'apellidos', '');

  -- Extraer rol del metadata (por defecto Vendedor)
  v_rol := COALESCE(
    (NEW.raw_user_meta_data->>'rol')::rol_usuario,
    'Vendedor'::rol_usuario
  );

  -- Insertar perfil en tabla usuarios
  INSERT INTO usuarios (
    id,
    email,
    nombres,
    apellidos,
    rol,
    estado,
    debe_cambiar_password
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_nombres,
    v_apellidos,
    v_rol,
    'Activo'::estado_usuario,
    true -- Primer login debe cambiar contraseña
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. TRIGGER en auth.users para crear perfil
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policy: Todos los usuarios autenticados pueden ver perfiles
CREATE POLICY "usuarios_pueden_ver_perfiles"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "usuarios_pueden_actualizar_propio_perfil"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND rol = (SELECT rol FROM usuarios WHERE id = auth.uid()) -- No pueden cambiar su propio rol
  );

-- Policy: Solo administradores pueden crear usuarios
CREATE POLICY "solo_admins_pueden_crear_usuarios"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol = 'Administrador'
      AND estado = 'Activo'
    )
  );

-- Policy: Solo administradores pueden actualizar otros usuarios
CREATE POLICY "solo_admins_pueden_actualizar_usuarios"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol = 'Administrador'
      AND estado = 'Activo'
    )
  );

-- Policy: Solo administradores pueden eliminar usuarios
CREATE POLICY "solo_admins_pueden_eliminar_usuarios"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol = 'Administrador'
      AND estado = 'Activo'
    )
  );

-- =====================================================
-- 10. FUNCIÓN para verificar si usuario es admin
-- =====================================================

CREATE OR REPLACE FUNCTION es_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = p_user_id
    AND rol = 'Administrador'
    AND estado = 'Activo'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION es_admin IS
  'Verifica si un usuario tiene rol de Administrador y está activo';

-- =====================================================
-- 11. FUNCIÓN para verificar permisos por rol
-- =====================================================

CREATE OR REPLACE FUNCTION tiene_rol(p_user_id UUID, p_roles rol_usuario[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = p_user_id
    AND rol = ANY(p_roles)
    AND estado = 'Activo'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION tiene_rol IS
  'Verifica si un usuario tiene uno de los roles especificados y está activo';

-- =====================================================
-- 12. VISTA para perfiles completos
-- =====================================================

CREATE OR REPLACE VIEW vista_usuarios_completos AS
SELECT
  u.id,
  u.email,
  u.nombres,
  u.apellidos,
  u.nombres || ' ' || u.apellidos AS nombre_completo,
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

  -- Información del usuario que lo creó
  creator.nombres || ' ' || creator.apellidos AS creado_por_nombre,

  -- Metadata de auth.users
  au.created_at AS fecha_registro_auth,
  au.last_sign_in_at AS ultimo_login_auth

FROM usuarios u
LEFT JOIN usuarios creator ON creator.id = u.creado_por
LEFT JOIN auth.users au ON au.id = u.id;

COMMENT ON VIEW vista_usuarios_completos IS
  'Vista completa de usuarios con información combinada de usuarios y auth.users';

-- =====================================================
-- 13. GRANTS
-- =====================================================

GRANT SELECT ON vista_usuarios_completos TO authenticated;
GRANT EXECUTE ON FUNCTION es_admin TO authenticated;
GRANT EXECUTE ON FUNCTION tiene_rol TO authenticated;

-- =====================================================
-- 14. CREAR PRIMER USUARIO ADMINISTRADOR (OPCIONAL)
-- =====================================================

-- NOTA: Descomentar y ajustar email si quieres crear admin inicial
-- UPDATE usuarios
-- SET rol = 'Administrador'
-- WHERE email = 'admin@ryrconstruccion.com';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
