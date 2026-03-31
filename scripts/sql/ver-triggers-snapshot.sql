-- Ver triggers que crean snapshots
SELECT
    t.tgname AS trigger_name,
    CASE
        WHEN t.tgtype::integer & 2 = 2 THEN 'BEFORE'
        ELSE 'AFTER'
    END AS timing,
    CASE
        WHEN t.tgtype::integer & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype::integer & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype::integer & 16 = 16 THEN 'UPDATE'
        ELSE 'MULTIPLE'
    END AS event,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'fuentes_pago'
  AND NOT t.tgisinternal
  AND (p.proname LIKE '%snapshot%' OR p.proname LIKE '%version%' OR p.proname LIKE '%historial%')
ORDER BY t.tgname;
