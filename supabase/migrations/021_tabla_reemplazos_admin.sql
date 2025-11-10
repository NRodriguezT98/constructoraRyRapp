-- =====================================================
-- MIGRACIÓN: Sistema de Reemplazo de Archivos (Admin)
-- =====================================================
-- Descripción: Tabla de auditoría para registrar cuando
--              un administrador reemplaza un archivo sin
--              crear nueva versión
-- Fecha: 2025-11-10
-- =====================================================

-- 1. Crear tabla de auditoría de reemplazos
CREATE TABLE IF NOT EXISTS documento_reemplazos_admin (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documento_id UUID NOT NULL REFERENCES documentos_proyecto(id) ON DELETE CASCADE,

  -- Información del archivo anterior (ya eliminado del storage)
  archivo_anterior TEXT NOT NULL,
  ruta_anterior TEXT NOT NULL,
  tamano_anterior BIGINT NOT NULL,
  hash_anterior TEXT, -- SHA256 del archivo eliminado (opcional pero recomendado)

  -- Información del archivo nuevo
  archivo_nuevo TEXT NOT NULL,
  ruta_nueva TEXT NOT NULL,
  tamano_nuevo BIGINT NOT NULL,
  hash_nuevo TEXT, -- SHA256 del archivo nuevo

  -- Auditoría y seguridad
  admin_id UUID NOT NULL REFERENCES usuarios(id),
  justificacion TEXT NOT NULL,
  ip_origen INET, -- IP desde donde se hizo el reemplazo
  user_agent TEXT, -- Navegador/dispositivo
  version_afectada INTEGER NOT NULL, -- Versión del documento en el momento del reemplazo

  -- Timestamps
  fecha_reemplazo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT justificacion_minima CHECK (char_length(justificacion) >= 10),
  CONSTRAINT tamano_positivo_anterior CHECK (tamano_anterior > 0),
  CONSTRAINT tamano_positivo_nuevo CHECK (tamano_nuevo > 0)
);

-- 2. Comentarios en tabla
COMMENT ON TABLE documento_reemplazos_admin IS
  'Registro de auditoría cuando un administrador reemplaza un archivo sin crear nueva versión';

COMMENT ON COLUMN documento_reemplazos_admin.justificacion IS
  'Justificación obligatoria del administrador (mínimo 10 caracteres)';

COMMENT ON COLUMN documento_reemplazos_admin.hash_anterior IS
  'Hash SHA256 del archivo eliminado para verificación de integridad';

-- 3. Índices para consultas rápidas
CREATE INDEX idx_reemplazos_documento
  ON documento_reemplazos_admin(documento_id);

CREATE INDEX idx_reemplazos_admin
  ON documento_reemplazos_admin(admin_id);

CREATE INDEX idx_reemplazos_fecha
  ON documento_reemplazos_admin(fecha_reemplazo DESC);

CREATE INDEX idx_reemplazos_version
  ON documento_reemplazos_admin(documento_id, version_afectada);

-- 4. Habilitar RLS
ALTER TABLE documento_reemplazos_admin ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS

-- Solo administradores pueden ver el historial de reemplazos
CREATE POLICY "Administradores pueden ver reemplazos"
  ON documento_reemplazos_admin
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol = 'Administrador'
    )
  );

-- Solo administradores pueden insertar registros de reemplazo
CREATE POLICY "Administradores pueden registrar reemplazos"
  ON documento_reemplazos_admin
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol = 'Administrador'
    )
    AND admin_id = auth.uid() -- El admin_id debe ser el usuario actual
  );

-- Nadie puede modificar o eliminar registros de auditoría (inmutables)
CREATE POLICY "Reemplazos son inmutables"
  ON documento_reemplazos_admin
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Reemplazos no se pueden eliminar"
  ON documento_reemplazos_admin
  FOR DELETE
  TO authenticated
  USING (false);

-- 6. Función para validar contraseña del admin antes de reemplazar
CREATE OR REPLACE FUNCTION validar_password_admin(
  p_user_id UUID,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_encrypted_password TEXT;
BEGIN
  -- Obtener password encriptado del usuario
  SELECT encrypted_password INTO v_encrypted_password
  FROM auth.users
  WHERE id = p_user_id;

  -- Verificar que existe el usuario
  IF v_encrypted_password IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verificar password con crypt
  -- Nota: Supabase usa bcrypt para passwords
  RETURN crypt(p_password, v_encrypted_password) = v_encrypted_password;
END;
$$;

COMMENT ON FUNCTION validar_password_admin IS
  'Valida la contraseña de un administrador antes de permitir reemplazo de archivo';

-- 7. Vista para consultar reemplazos con información del admin y documento
CREATE OR REPLACE VIEW v_reemplazos_admin AS
SELECT
  r.id,
  r.documento_id,
  d.titulo as documento_titulo,
  r.archivo_anterior,
  r.archivo_nuevo,
  r.tamano_anterior,
  r.tamano_nuevo,
  r.justificacion,
  r.version_afectada,
  r.fecha_reemplazo,
  r.ip_origen,
  u.nombres || ' ' || u.apellidos as admin_nombre,
  u.email as admin_email,
  CASE
    WHEN r.tamano_nuevo > r.tamano_anterior
    THEN '+' || pg_size_pretty(r.tamano_nuevo - r.tamano_anterior)
    ELSE '-' || pg_size_pretty(r.tamano_anterior - r.tamano_nuevo)
  END as diferencia_tamano
FROM documento_reemplazos_admin r
JOIN documentos_proyecto d ON r.documento_id = d.id
JOIN usuarios u ON r.admin_id = u.id
ORDER BY r.fecha_reemplazo DESC;

COMMENT ON VIEW v_reemplazos_admin IS
  'Vista con información completa de reemplazos de archivos por administradores';

-- 8. Grant de permisos
GRANT SELECT ON v_reemplazos_admin TO authenticated;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
