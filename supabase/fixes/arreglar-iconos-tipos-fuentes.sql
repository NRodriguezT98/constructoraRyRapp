-- =====================================================
-- Arreglar Iconos Inválidos en tipos_fuentes_pago
-- =====================================================
-- Problema detectado:
--   - Gift → No existe en ICON_MAP (usar HandCoins)
--   - HomeIcon → No existe (usar Home)
--
-- Fecha: 2025-12-22
-- =====================================================

-- Subsidio Mi Casa Ya: Gift → HandCoins
UPDATE tipos_fuentes_pago
SET icono = 'HandCoins'
WHERE codigo = 'subsidio_mi_casa_ya'
  AND icono = 'Gift';

-- Subsidio Caja Compensación: HomeIcon → Home
UPDATE tipos_fuentes_pago
SET icono = 'Home'
WHERE codigo = 'subsidio_caja_compensacion'
  AND icono = 'HomeIcon';

-- Verificar resultados
SELECT
  id,
  nombre,
  codigo,
  icono,
  color,
  activo,
  orden
FROM tipos_fuentes_pago
ORDER BY orden;
