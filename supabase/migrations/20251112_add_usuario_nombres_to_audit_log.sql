-- =====================================================
-- AGREGAR NOMBRES DE USUARIO A AUDIT_LOG
-- =====================================================
-- Fecha: 2025-11-12
-- Descripción: Agregar columna usuario_nombres para mejorar
--              la visualización en el módulo de auditorías
-- =====================================================

-- Agregar columna usuario_nombres
ALTER TABLE audit_log
ADD COLUMN IF NOT EXISTS usuario_nombres varchar(255);

-- Comentario
COMMENT ON COLUMN audit_log.usuario_nombres IS
'Nombres completos del usuario que realizó la acción (guardado para mantener historial incluso si el usuario cambia sus datos)';

-- Crear índice para búsqueda por nombre
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario_nombres
ON audit_log(usuario_nombres)
WHERE usuario_nombres IS NOT NULL;

-- Actualizar registros existentes con nombres desde la tabla usuarios
UPDATE audit_log al
SET usuario_nombres = u.nombres
FROM usuarios u
WHERE al.usuario_id = u.id
AND al.usuario_nombres IS NULL;

-- Validación
DO $$
BEGIN
  RAISE NOTICE '✅ Columna usuario_nombres agregada a audit_log';
  RAISE NOTICE '✅ Índice idx_audit_log_usuario_nombres creado';
  RAISE NOTICE '✅ Registros existentes actualizados con nombres de usuarios';
END $$;
