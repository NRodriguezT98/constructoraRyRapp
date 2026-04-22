-- Verificar si existe la función tiene_permiso y su código
SELECT
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'tiene_permiso';
