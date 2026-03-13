-- ============================================
-- Refrescar Schema Cache de Supabase
-- ============================================
-- Fecha: 2025-12-10
-- Descripción: Forzar a PostgREST a recargar el schema
--              después de eliminar la columna categoria_id
-- ============================================

-- Notificar a PostgREST que recargue el schema
NOTIFY pgrst, 'reload schema';

-- Alternativa: Recargar configuración
SELECT pg_notify('pgrst', 'reload config');

-- Verificar que categoria_id NO existe
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'documentos_pendientes';
