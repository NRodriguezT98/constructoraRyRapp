-- Verificar si audit_log existe y tiene datos
SELECT
  'audit_log' as tabla,
  COUNT(*) as total_registros,
  MAX(fecha_evento) as ultimo_evento
FROM audit_log
LIMIT 1;
