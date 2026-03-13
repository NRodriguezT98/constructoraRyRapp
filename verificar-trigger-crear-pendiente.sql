-- 🔍 VERIFICAR SI EXISTE TRIGGER DE CREACIÓN AUTOMÁTICA DE PENDIENTES
-- Buscar trigger en fuentes_pago que cree documentos_pendientes

-- 1️⃣ Ver todos los triggers en fuentes_pago
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'Enabled ✅'
    WHEN 'D' THEN 'Disabled ❌'
  END as status,
  obj_description(t.oid, 'pg_trigger') as description
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'fuentes_pago'
  AND NOT t.tgisinternal  -- Excluir triggers internos
ORDER BY t.tgname;

-- 2️⃣ Ver funciones relacionadas con documentos_pendientes
SELECT
  proname as function_name,
  pg_get_functiondef(oid) as definition_preview
FROM pg_proc
WHERE proname LIKE '%pendiente%'
  OR proname LIKE '%documento%'
ORDER BY proname;
