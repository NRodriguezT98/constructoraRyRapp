-- Listar todos los triggers activos y sus funciones en el schema público
SELECT
  c.relname AS tabla,
  t.tgname AS trigger,
  p.proname AS funcion,
  pg_get_functiondef(p.oid) AS cuerpo_funcion
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND t.tgisinternal = false
ORDER BY c.relname, t.tgname;
