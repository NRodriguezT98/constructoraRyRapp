-- Eliminar TODOS los documentos pendientes de Pedrito para prueba limpia
DELETE FROM documentos_pendientes
WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb';

-- Verificar que no quede ninguno
SELECT COUNT(*) as total
FROM documentos_pendientes
WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb';
