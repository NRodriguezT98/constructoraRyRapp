-- Ver el código fuente de las funciones de trigger de abonos_historial
SELECT
  p.proname AS function_name,
  p.prosrc AS source_code
FROM pg_proc p
WHERE p.proname IN (
  'actualizar_monto_recibido_fuente',
  'validar_abono_no_excede_saldo',
  'update_abonos_historial_fecha_actualizacion'
);
