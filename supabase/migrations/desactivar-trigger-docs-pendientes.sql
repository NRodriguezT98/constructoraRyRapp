-- ELIMINAR trigger que crea documentos pendientes automáticamente
-- Razón: El código TypeScript ya los crea manualmente en useAsignarViviendaPage.ts
-- Esto evita duplicados (trigger + código manual = 2x documentos)

-- Eliminar el trigger
DROP TRIGGER IF EXISTS trigger_crear_documento_pendiente ON fuentes_pago;

-- Eliminar la función asociada (opcional, pero recomendado)
DROP FUNCTION IF EXISTS crear_documento_pendiente_automatico();

-- Verificar que fue eliminado (no debería retornar filas)
SELECT
  t.tgname as trigger_name,
  p.proname as function_name
FROM pg_trigger t
INNER JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'trigger_crear_documento_pendiente';
