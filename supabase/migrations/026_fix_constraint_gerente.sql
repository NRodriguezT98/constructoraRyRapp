-- Modificar constraint CHECK para permitir "Gerente" en lugar de "Gerencia"

-- 1. Eliminar constraint antigua
ALTER TABLE permisos_rol DROP CONSTRAINT IF EXISTS permisos_rol_rol_check;

-- 2. Crear constraint nueva con "Gerente"
ALTER TABLE permisos_rol
ADD CONSTRAINT permisos_rol_rol_check
CHECK (rol IN ('Administrador', 'Contador', 'Supervisor', 'Gerente'));

-- Verificar
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'permisos_rol'::regclass
AND conname LIKE '%rol_check%';
