-- Diagnóstico: buscar eventos ANULAR de abonos en audit_log
SELECT
  al.id,
  al.accion,
  al.tabla,
  al.fecha_evento,
  al.usuario_email,
  al.metadata->>'cliente_id'          AS cliente_id,
  al.metadata->>'abono_monto'         AS monto,
  al.metadata->>'abono_numero_recibo' AS recibo,
  al.metadata->>'motivo_categoria'    AS motivo,
  al.metadata->>'anulado_por_nombre'  AS anulado_por,
  al.metadata->>'proyecto_nombre'     AS proyecto,
  al.metadata->>'manzana_nombre'      AS manzana,
  al.metadata->>'vivienda_numero'     AS vivienda
FROM audit_log al
WHERE al.tabla = 'abonos_historial'
ORDER BY al.fecha_evento DESC
LIMIT 20;
