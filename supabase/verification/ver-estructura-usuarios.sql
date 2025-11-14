-- Verificar estructura tabla usuarios
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'usuarios'
  AND column_name = 'rol'
ORDER BY ordinal_position;
