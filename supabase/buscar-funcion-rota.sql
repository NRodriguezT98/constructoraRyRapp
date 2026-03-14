-- Buscar el trigger roto en fuentes_pago y cualquier otra tabla
SELECT
  p.proname AS function_name,
  p.prosrc AS source_code
FROM pg_proc p
WHERE p.prosrc ILIKE '%carta_aprobacion_url%';
