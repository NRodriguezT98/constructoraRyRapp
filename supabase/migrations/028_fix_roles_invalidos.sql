-- Actualizar usuarios con roles antiguos a roles válidos

-- 1. Ver usuarios con roles no válidos
SELECT
  id,
  email,
  nombres,
  apellidos,
  rol
FROM perfiles
WHERE rol NOT IN ('Administrador', 'Contador', 'Supervisor', 'Gerente');

-- 2. Actualizar usuarios "Vendedor" → "Supervisor"
UPDATE perfiles
SET rol = 'Supervisor'
WHERE rol = 'Vendedor';

-- 3. Verificar actualización
SELECT
  id,
  email,
  nombres,
  apellidos,
  rol
FROM perfiles
ORDER BY created_at DESC;
