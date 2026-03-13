-- Consultar vistas que dependen de fuentes_pago
SELECT
  v.table_name AS view_name,
  v.view_definition
FROM information_schema.views v
WHERE v.table_schema = 'public'
  AND v.view_definition ILIKE '%fuentes_pago%'
ORDER BY v.table_name;
