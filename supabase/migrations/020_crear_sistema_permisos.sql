-- ============================================
-- MIGRACIÓN: Sistema de Permisos Configurable
-- ============================================
-- Descripción: Crea tabla permisos_rol para gestión dinámica de permisos
-- Fecha: 2025-11-14
-- Autor: Sistema RyR
-- Versión: 1.0
-- ============================================

-- ============================================
-- 1. ELIMINAR TIPOS ENUM ANTIGUOS (si existen)
-- ============================================

-- No crear tipos enum nuevos, usar TEXT con constraints

-- ============================================
-- 2. CREAR TABLA DE PERMISOS
-- ============================================

CREATE TABLE IF NOT EXISTS permisos_rol (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificadores (usando TEXT en lugar de ENUM para flexibilidad)
  rol TEXT NOT NULL CHECK (rol IN ('Administrador', 'Contador', 'Supervisor', 'Gerencia')),
  modulo TEXT NOT NULL,
  accion TEXT NOT NULL,

  -- Control
  permitido BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  descripcion TEXT,

  -- Auditoría
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_por UUID REFERENCES auth.users(id),

  -- Constraint para evitar duplicados
  UNIQUE(rol, modulo, accion)
);

-- ============================================
-- 3. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX IF NOT EXISTS idx_permisos_rol_rol ON permisos_rol(rol);
CREATE INDEX IF NOT EXISTS idx_permisos_rol_modulo ON permisos_rol(modulo);
CREATE INDEX IF NOT EXISTS idx_permisos_rol_rol_modulo ON permisos_rol(rol, modulo);

-- ============================================
-- 4. FUNCIÓN DE TIMESTAMP AUTOMÁTICO
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_timestamp_permisos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGER PARA ACTUALIZAR TIMESTAMP
-- ============================================

DROP TRIGGER IF EXISTS trigger_actualizar_timestamp_permisos ON permisos_rol;

CREATE TRIGGER trigger_actualizar_timestamp_permisos
  BEFORE UPDATE ON permisos_rol
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_permisos();

-- ============================================
-- 6. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE permisos_rol IS 'Tabla de permisos configurables por rol. Permite gestión dinámica desde UI.';
COMMENT ON COLUMN permisos_rol.rol IS 'Rol del sistema: Administrador, Contador, Supervisor, Gerencia';
COMMENT ON COLUMN permisos_rol.modulo IS 'Módulo del sistema: proyectos, viviendas, clientes, documentos, etc.';
COMMENT ON COLUMN permisos_rol.accion IS 'Acción permitida: ver, crear, editar, eliminar, aprobar, exportar, etc.';
COMMENT ON COLUMN permisos_rol.permitido IS 'Si el permiso está activo o revocado';

-- ============================================
-- 7. RLS POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE permisos_rol ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden LEER sus propios permisos
CREATE POLICY "Usuarios pueden ver permisos de su rol"
  ON permisos_rol
  FOR SELECT
  TO authenticated
  USING (
    rol::text = (
      SELECT u.rol::text
      FROM usuarios u
      WHERE u.id = auth.uid()
    )
  );

-- Policy: Solo ADMINISTRADORES pueden MODIFICAR permisos
CREATE POLICY "Solo administradores pueden modificar permisos"
  ON permisos_rol
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM usuarios u
      WHERE u.id = auth.uid()
        AND u.rol::text = 'Administrador'
        AND u.estado = 'Activo'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM usuarios u
      WHERE u.id = auth.uid()
        AND u.rol::text = 'Administrador'
        AND u.estado = 'Activo'
    )
  );

-- ============================================
-- 8. FUNCIÓN HELPER PARA VERIFICAR PERMISOS
-- ============================================

CREATE OR REPLACE FUNCTION tiene_permiso(
  p_usuario_id UUID,
  p_modulo TEXT,
  p_accion TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_rol TEXT;
  v_tiene_permiso BOOLEAN;
BEGIN
  -- Obtener rol del usuario
  SELECT rol::text INTO v_rol
  FROM usuarios
  WHERE id = p_usuario_id AND estado = 'Activo';

  -- Si no tiene rol, no tiene permiso
  IF v_rol IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Administrador tiene todos los permisos (bypass)
  IF v_rol = 'Administrador' THEN
    RETURN TRUE;
  END IF;

  -- Verificar permiso específico
  SELECT permitido INTO v_tiene_permiso
  FROM permisos_rol
  WHERE rol = v_rol
    AND modulo = p_modulo
    AND accion = p_accion;

  -- Si no existe registro, por defecto NO tiene permiso
  RETURN COALESCE(v_tiene_permiso, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION tiene_permiso IS 'Verifica si un usuario tiene permiso específico. Administrador bypass automático.';

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla permisos_rol creada exitosamente';
  RAISE NOTICE '✅ Índices creados para optimización';
  RAISE NOTICE '✅ RLS policies habilitadas';
  RAISE NOTICE '✅ Función tiene_permiso() disponible';
  RAISE NOTICE '⏭️ Ejecutar: 021_seed_permisos_iniciales.sql';
END $$;
