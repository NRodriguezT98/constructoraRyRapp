-- 🔍 VERIFICAR ESTADO DEL TRIGGER
-- Ver si el trigger de vinculación automática existe y está habilitado

SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  t.tgenabled as is_enabled,
  CASE t.tgenabled
    WHEN 'O' THEN 'Enabled'
    WHEN 'D' THEN 'Disabled'
    WHEN 'R' THEN 'Replica'
    WHEN 'A' THEN 'Always'
  END as status,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'documentos_cliente'
  AND t.tgname LIKE '%vincular%'
ORDER BY t.tgname;
