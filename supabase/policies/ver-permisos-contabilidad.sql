-- Ver qué tiene el rol Contabilidad para módulo documentos y módulos relacionados
SELECT modulo, accion, permitido
FROM permisos_rol
WHERE rol = 'Contabilidad'
ORDER BY modulo, accion;
