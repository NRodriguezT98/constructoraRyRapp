-- Verificar emails en negociaciones_historial
SELECT
  id,
  version,
  tipo_cambio,
  usuario_id,
  usuario_email,
  TO_CHAR(fecha_cambio, 'YYYY-MM-DD HH24:MI:SS') as fecha_cambio
FROM negociaciones_historial
ORDER BY fecha_cambio DESC
LIMIT 50;

-- Estadísticas
SELECT
  COUNT(*) as total_registros,
  COUNT(usuario_email) as con_email,
  COUNT(*) - COUNT(usuario_email) as sin_email
FROM negociaciones_historial;
