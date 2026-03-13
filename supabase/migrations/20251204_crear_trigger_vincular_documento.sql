-- ============================================
-- CREAR TRIGGER FALTANTE: vincular_documento_pendiente_automatico
-- ============================================
--
-- Problema: Función existe pero NUNCA se creó el trigger
-- Solución: Crear trigger en documentos_cliente AFTER INSERT
--
-- Fecha: 2025-12-04
-- ============================================

-- 1. Verificar que la función existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'vincular_documento_pendiente_automatico'
  ) THEN
    RAISE EXCEPTION 'Función vincular_documento_pendiente_automatico NO existe. Ejecutar migración 20251203_fix_funcion_vincular_documento.sql primero';
  END IF;
END$$;

-- 2. Eliminar trigger si existe (por si acaso)
DROP TRIGGER IF EXISTS trigger_vincular_documento_pendiente
  ON documentos_cliente;

-- 3. Crear trigger que ejecuta la función
CREATE TRIGGER trigger_vincular_documento_pendiente
  AFTER INSERT ON documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION vincular_documento_pendiente_automatico();

-- 4. Verificar que quedó creado
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'Enabled ✅'
    WHEN 'D' THEN 'Disabled ❌'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'documentos_cliente'
  AND t.tgname = 'trigger_vincular_documento_pendiente';

-- ============================================
-- ✅ RESULTADO ESPERADO:
-- trigger_name                          | table_name        | function_name                           | status
-- trigger_vincular_documento_pendiente  | documentos_cliente| vincular_documento_pendiente_automatico | Enabled ✅
-- ============================================
