-- =====================================================
-- AGREGAR COLUMNA: usuario_nombre a negociaciones_historial
-- =====================================================
-- Propósito: Mostrar nombre completo en UI en lugar de email
-- Fecha: 2025-12-03
-- =====================================================

-- 1. Agregar columna usuario_nombre
ALTER TABLE negociaciones_historial
  ADD COLUMN IF NOT EXISTS usuario_nombre VARCHAR(255);

-- 2. Poblar datos históricos desde usuarios (tabla pública)
UPDATE negociaciones_historial nh
SET usuario_nombre = u.nombres || ' ' || COALESCE(u.apellidos, '')
FROM usuarios u
WHERE nh.usuario_id = u.id
  AND nh.usuario_nombre IS NULL;

-- 3. Crear índice
CREATE INDEX IF NOT EXISTS idx_historial_usuario_nombre
  ON negociaciones_historial(usuario_nombre);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
DECLARE
  total INTEGER;
  con_nombre INTEGER;
BEGIN
  SELECT COUNT(*) INTO total FROM negociaciones_historial;
  SELECT COUNT(*) INTO con_nombre FROM negociaciones_historial WHERE usuario_nombre IS NOT NULL;

  RAISE NOTICE '✅ Columna usuario_nombre agregada';
  RAISE NOTICE '📊 Total registros: %', total;
  RAISE NOTICE '👤 Con nombre: %', con_nombre;
END $$;

-- Ver resultado
SELECT
  version,
  tipo_cambio,
  usuario_nombre,
  usuario_email,
  TO_CHAR(fecha_cambio, 'DD-Mon-YYYY HH24:MI') as fecha
FROM negociaciones_historial
ORDER BY fecha_cambio DESC
LIMIT 10;
