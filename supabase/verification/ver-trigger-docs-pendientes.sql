-- Ver si existe el trigger de creación automática de documentos pendientes
SELECT
  t.tgname as trigger_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
INNER JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'trigger_crear_documento_pendiente';
