-- Todos los triggers con estado habilitado/deshabilitado
SELECT
    t.trigger_name,
    t.event_object_table AS tabla,
    t.event_manipulation AS evento,
    t.action_timing AS momento,
    CASE
        WHEN tr.tgenabled = 'D' THEN 'DESHABILITADO'
        WHEN tr.tgenabled = 'O' THEN 'HABILITADO'
        WHEN tr.tgenabled = 'R' THEN 'REPLICA'
        WHEN tr.tgenabled = 'A' THEN 'SIEMPRE'
        ELSE tr.tgenabled::text
    END AS estado
FROM information_schema.triggers t
JOIN pg_trigger tr ON tr.tgname = t.trigger_name
JOIN pg_class pc ON pc.oid = tr.tgrelid
JOIN pg_namespace pn ON pn.oid = pc.relnamespace
WHERE pn.nspname = 'public'
  AND NOT tr.tgisinternal
ORDER BY t.event_object_table, t.trigger_name;
