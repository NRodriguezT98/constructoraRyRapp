-- Ver columnas disponibles en auth.sessions
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'sessions'
ORDER BY ordinal_position;
