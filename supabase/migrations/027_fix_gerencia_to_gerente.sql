-- Paso 1: Eliminar constraint temporalmente
ALTER TABLE permisos_rol DROP CONSTRAINT IF EXISTS permisos_rol_rol_check;

-- Paso 2: Actualizar filas de "Gerencia" a "Gerente"
UPDATE permisos_rol
SET rol = 'Gerente'
WHERE rol = 'Gerencia';

-- Paso 3: Crear constraint nueva con "Gerente"
ALTER TABLE permisos_rol
ADD CONSTRAINT permisos_rol_rol_check
CHECK (rol IN ('Administrador', 'Contador', 'Supervisor', 'Gerente'));

-- Verificar resultado
SELECT rol, COUNT(*) as cantidad_permisos
FROM permisos_rol
GROUP BY rol
ORDER BY rol;
