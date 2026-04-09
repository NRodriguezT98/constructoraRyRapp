-- Verificar que el backfill del evento ANULAR fue exitoso
SELECT
  al.id,
  al.accion,
  al.fecha_evento,
  al.usuario_email,
  al.metadata->>'cliente_id'          AS cliente_id,
  al.metadata->>'abono_numero_recibo' AS recibo,
  al.metadata->>'abono_monto'         AS monto,
  al.metadata->>'motivo_categoria'    AS motivo,
  al.metadata->>'anulado_por_nombre'  AS anulado_por
FROM audit_log al
WHERE al.tabla = 'abonos_historial'
  AND al.registro_id = 'ffbc5532-afa1-4b71-804b-b4996c6221e9'
ORDER BY al.fecha_evento;
