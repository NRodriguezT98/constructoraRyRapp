-- ============================================
-- FIX: Refrescar schema cache de PostgREST
-- ============================================
-- Ejecutar cuando las columnas nuevas (alcance, etc.) no son reconocidas
-- por la API de Supabase (errores 400 en select=*)
-- ============================================

-- 1. Verificar columnas actuales de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'requisitos_fuentes_pago_config'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Asegurar que la columna alcance existe (idempotente)
ALTER TABLE public.requisitos_fuentes_pago_config
ADD COLUMN IF NOT EXISTS alcance VARCHAR(30) DEFAULT 'ESPECIFICO_FUENTE'
CHECK (alcance IN ('ESPECIFICO_FUENTE', 'COMPARTIDO_CLIENTE'));

-- 3. Refrescar schema cache de PostgREST (crucial para que reconozca columnas nuevas)
-- Esto notifica a PostgREST para recargar su caché del schema de la BD
NOTIFY pgrst, 'reload schema';

-- 4. Verificar requisitos activos por alcance
SELECT alcance, COUNT(*) as total
FROM public.requisitos_fuentes_pago_config
WHERE activo = true
GROUP BY alcance;
