-- 🔍 VERIFICAR ESTRUCTURA DE AUDIT_LOG
-- El error indica que registro_id es UUID pero recibe TEXT

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'audit_log'
  AND column_name IN ('registro_id', 'tabla', 'accion', 'usuario_email')
ORDER BY ordinal_position;
