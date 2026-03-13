-- ============================================
-- Consulta para obtener tipos de fuentes de pago reales del sistema
-- ============================================
-- Fecha: 2025-12-13
-- Propósito: Reemplazar array hardcodeado TIPOS_FUENTE con datos dinámicos

SELECT DISTINCT
  tipo as value,
  tipo as label,
  COUNT(*) OVER (PARTITION BY tipo) as cantidad
FROM fuentes_pago
WHERE tipo IS NOT NULL
ORDER BY tipo;

-- Resultado esperado:
-- | value                         | label                         | cantidad |
-- |-------------------------------|-------------------------------|----------|
-- | Crédito Hipotecario          | Crédito Hipotecario          | 5        |
-- | Cuota Inicial                | Cuota Inicial                | 10       |
-- | Subsidio Caja Compensación   | Subsidio Caja Compensación   | 3        |
-- | Subsidio Mi Casa Ya          | Subsidio Mi Casa Ya          | 2        |
