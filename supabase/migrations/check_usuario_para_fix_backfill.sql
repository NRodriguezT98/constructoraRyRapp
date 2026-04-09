-- Buscar el usuario para corregir el evento de backfill
-- y actualizar el audit_log CREATE del abono ffbc5532

-- 1. Ver qué tiene actualmente el evento de backfill
SELECT
  al.id                               AS evento_id,
  al.accion,
  al.usuario_id,
  al.usuario_email,
  al.usuario_nombres,
  al.fecha_evento
FROM audit_log al
WHERE al.tabla = 'abonos_historial'
  AND al.registro_id = 'ffbc5532-afa1-4b71-804b-b4996c6221e9'
  AND al.accion = 'CREATE';

-- 2. Ver usuarios administradores disponibles (para identificar al correcto)
SELECT id, email, nombres, apellidos, rol
FROM usuarios
ORDER BY nombres;
