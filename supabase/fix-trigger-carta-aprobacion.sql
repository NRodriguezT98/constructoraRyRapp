-- 1. Ver el trigger en fuentes_pago que llama a la función rota
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'fuentes_pago'
  AND action_statement ILIKE '%actualizar_estado_documentacion_fuente%';

-- 2. Eliminar el trigger y la función obsoleta
-- (carta_aprobacion_url fue eliminada, el trigger ya no es válido)
DROP TRIGGER IF EXISTS trigger_actualizar_estado_documentacion ON public.fuentes_pago;
DROP TRIGGER IF EXISTS trigger_actualizar_estado_documentacion_fuente ON public.fuentes_pago;

-- 3. Recrear la función como no-op temporal (mantiene compatibilidad)
CREATE OR REPLACE FUNCTION actualizar_estado_documentacion_fuente()
RETURNS TRIGGER AS $$
BEGIN
  -- La gestión de documentación fue migrada al módulo de documentos.
  -- La columna carta_aprobacion_url ya no existe en fuentes_pago.
  -- Este trigger fue desactivado para evitar errores de referencia.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
