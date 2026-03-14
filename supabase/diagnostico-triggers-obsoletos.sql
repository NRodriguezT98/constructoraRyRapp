-- Buscar TODOS los triggers cuyas funciones referencian tablas obsoletas
SELECT
  c.relname AS tabla,
  t.tgname AS trigger_name,
  p.proname AS funcion,
  CASE
    WHEN pg_get_functiondef(p.oid) ILIKE '%documentos_pendientes%' AND pg_get_functiondef(p.oid) ILIKE '%pasos_fuente_pago%'
      THEN 'documentos_pendientes + pasos_fuente_pago'
    WHEN pg_get_functiondef(p.oid) ILIKE '%documentos_pendientes%'
      THEN 'documentos_pendientes'
    WHEN pg_get_functiondef(p.oid) ILIKE '%pasos_fuente_pago%'
      THEN 'pasos_fuente_pago'
  END AS referencias_obsoletas
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND t.tgisinternal = false
  AND (
    pg_get_functiondef(p.oid) ILIKE '%documentos_pendientes%'
    OR pg_get_functiondef(p.oid) ILIKE '%pasos_fuente_pago%'
  )
ORDER BY c.relname, t.tgname;
