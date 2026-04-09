SELECT
  al.id,
  al.fecha_evento,
  al.metadata->>'cliente_nombre' AS cliente,
  al.metadata->>'abono_monto' AS monto,
  al.metadata->>'abono_numero_recibo' AS recibo,
  al.metadata->>'proyecto_nombre' AS proyecto,
  al.metadata->>'manzana_nombre' AS manzana,
  al.metadata->>'vivienda_numero' AS vivienda,
  al.metadata->>'backfill' AS es_backfill
FROM audit_log al
WHERE al.tabla = 'abonos_historial'
  AND al.accion = 'CREATE'
ORDER BY al.fecha_evento DESC;
