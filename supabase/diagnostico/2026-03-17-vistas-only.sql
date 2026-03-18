-- Vistas existentes
SELECT viewname
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;
