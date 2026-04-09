-- Diagnóstico completo: buscar abonos anulados y verificar si tienen audit_log
SELECT
  ah.id                        AS abono_id,
  ah.numero_recibo,
  ah.monto,
  ah.estado,
  ah.motivo_categoria,
  ah.anulado_por_nombre,
  ah.fecha_anulacion,
  ah.negociacion_id,
  -- Verificar si tiene registro en audit_log
  (SELECT COUNT(*) FROM audit_log al
   WHERE al.tabla = 'abonos_historial'
     AND al.registro_id = ah.id
     AND al.accion = 'ANULAR') AS tiene_audit_anular,
  (SELECT COUNT(*) FROM audit_log al
   WHERE al.tabla = 'abonos_historial'
     AND al.registro_id = ah.id) AS total_eventos_audit
FROM abonos_historial ah
WHERE ah.estado = 'Anulado'
   OR ah.fecha_anulacion IS NOT NULL
ORDER BY ah.fecha_anulacion DESC NULLS LAST;
