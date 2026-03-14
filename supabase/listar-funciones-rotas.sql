-- Ver TODAS las funciones que referencian carta_aprobacion_url con nombre
SELECT p.proname AS function_name, LEFT(p.prosrc, 200) AS preview
FROM pg_proc p
WHERE p.prosrc ILIKE '%carta_aprobacion_url%'
ORDER BY p.proname;
