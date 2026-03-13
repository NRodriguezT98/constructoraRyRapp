-- =====================================================
-- POBLAR MANUALMENTE usuario_email en registros históricos
-- =====================================================
-- Para los registros que ya existen sin email

-- 1. Verificar estado actual
SELECT
  'ANTES' as momento,
  COUNT(*) as total,
  COUNT(usuario_email) as con_email,
  COUNT(*) FILTER (WHERE usuario_email IS NULL AND usuario_id IS NOT NULL) as sin_email_pero_con_id
FROM negociaciones_historial;

-- 2. Poblar emails desde auth.users
UPDATE negociaciones_historial nh
SET usuario_email = u.email
FROM auth.users u
WHERE nh.usuario_id = u.id
  AND nh.usuario_email IS NULL;

-- 3. Verificar resultado
SELECT
  'DESPUES' as momento,
  COUNT(*) as total,
  COUNT(usuario_email) as con_email,
  COUNT(*) FILTER (WHERE usuario_email IS NULL AND usuario_id IS NOT NULL) as sin_email_pero_con_id
FROM negociaciones_historial;

-- 4. Mostrar registros actualizados
SELECT
  version,
  tipo_cambio,
  usuario_id,
  usuario_email,
  TO_CHAR(fecha_cambio, 'DD-Mon-YYYY HH24:MI') as fecha
FROM negociaciones_historial
ORDER BY fecha_cambio DESC
LIMIT 10;
