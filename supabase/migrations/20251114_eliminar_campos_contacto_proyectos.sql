-- Migración: Eliminar campos de contacto de tabla proyectos
-- Fecha: 2025-11-14
-- Descripción: Eliminar responsable, telefono y email ya que no son necesarios

-- Eliminar columnas de contacto
ALTER TABLE proyectos
  DROP COLUMN IF EXISTS responsable,
  DROP COLUMN IF EXISTS telefono,
  DROP COLUMN IF EXISTS email;

-- Comentario para documentación
COMMENT ON TABLE proyectos IS 'Tabla de proyectos sin información de contacto (contacto se maneja en otros módulos)';
