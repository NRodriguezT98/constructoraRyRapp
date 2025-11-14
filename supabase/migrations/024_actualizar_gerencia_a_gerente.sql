-- Actualizar permisos de "Gerencia" a "Gerente"
-- Esto es necesario porque el enum usa "Gerente" no "Gerencia"

UPDATE permisos_rol
SET rol = 'Gerente'
WHERE rol = 'Gerencia';

-- Verificar cambios
SELECT rol, COUNT(*) as cantidad
FROM permisos_rol
GROUP BY rol
ORDER BY rol;
