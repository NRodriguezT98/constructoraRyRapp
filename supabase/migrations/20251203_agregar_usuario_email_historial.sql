-- =====================================================
-- AGREGAR COLUMNA: usuario_email a negociaciones_historial
-- =====================================================
-- Propósito: Capturar email del usuario al momento de crear snapshot
-- Ventajas:
--   - No requiere JOIN con auth.users
--   - Preserva email histórico (auditoría completa)
--   - Query simple y rápido
-- Fecha: 2025-12-03
-- =====================================================

-- 1. Agregar columna usuario_email
ALTER TABLE negociaciones_historial
  ADD COLUMN IF NOT EXISTS usuario_email VARCHAR(255);

-- 2. Poblar datos históricos desde auth.users (migración de datos)
UPDATE negociaciones_historial nh
SET usuario_email = u.email
FROM auth.users u
WHERE nh.usuario_id = u.id
  AND nh.usuario_email IS NULL;

-- 3. Crear índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_historial_usuario_email
  ON negociaciones_historial(usuario_email);

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON COLUMN negociaciones_historial.usuario_email IS
  'Email del usuario al momento del cambio (desnormalizado para auditoría histórica)';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
DECLARE
  registros_actualizados INTEGER;
  registros_totales INTEGER;
BEGIN
  SELECT COUNT(*) INTO registros_totales FROM negociaciones_historial;
  SELECT COUNT(*) INTO registros_actualizados
  FROM negociaciones_historial
  WHERE usuario_email IS NOT NULL;

  RAISE NOTICE '✅ Columna usuario_email agregada';
  RAISE NOTICE '📊 Registros totales: %', registros_totales;
  RAISE NOTICE '📧 Registros con email: %', registros_actualizados;
  RAISE NOTICE '📌 De ahora en adelante, capturar email al crear snapshot';
END $$;
