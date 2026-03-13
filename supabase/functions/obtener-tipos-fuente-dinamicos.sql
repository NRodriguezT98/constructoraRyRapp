-- ============================================
-- RPC: Obtener tipos de fuente dinámicos (optimizado)
-- ============================================
-- Fecha: 2025-12-13
-- Propósito: Función SQL para obtener tipos de fuente con conteo

CREATE OR REPLACE FUNCTION obtener_tipos_fuente_dinamicos()
RETURNS TABLE (
  value TEXT,
  label TEXT,
  cantidad BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    tipo::TEXT as value,
    tipo::TEXT as label,
    COUNT(*)::BIGINT as cantidad
  FROM fuentes_pago
  WHERE tipo IS NOT NULL
  GROUP BY tipo
  ORDER BY tipo;
$$;

-- Comentario para documentación
COMMENT ON FUNCTION obtener_tipos_fuente_dinamicos() IS
'Retorna todos los tipos de fuente de pago existentes en el sistema con su conteo.
Usado para poblar selectores dinámicos en UI.';
