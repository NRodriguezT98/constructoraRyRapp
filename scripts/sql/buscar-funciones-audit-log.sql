-- Buscar TODAS las funciones que usan audit_log
SELECT
  p.proname AS funcion,
  CASE
    WHEN pg_get_functiondef(p.oid) LIKE '%tabla_afectada%' THEN 'USA_tabla_afectada'
    WHEN pg_get_functiondef(p.oid) LIKE '%audit_log%' THEN 'Usa_audit_log'
    ELSE 'No_usa_audit_log'
  END as estado
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) LIKE '%audit_log%'
ORDER BY
  CASE
    WHEN pg_get_functiondef(p.oid) LIKE '%tabla_afectada%' THEN 1
    ELSE 2
  END,
  p.proname;
