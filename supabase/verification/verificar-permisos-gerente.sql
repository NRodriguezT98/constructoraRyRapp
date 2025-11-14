-- Verificar permisos del rol Gerente

-- 1. Contar permisos por rol
SELECT
  rol,
  COUNT(*) as total_permisos
FROM permisos_rol
GROUP BY rol
ORDER BY rol;

-- 2. Mostrar algunos permisos de Gerente
SELECT
  modulo,
  accion,
  rol
FROM permisos_rol
WHERE rol = 'Gerente'
ORDER BY modulo, accion
LIMIT 10;

-- 3. Verificar si todavía existen permisos con "Gerencia"
SELECT COUNT(*) as permisos_gerencia
FROM permisos_rol
WHERE rol = 'Gerencia';
