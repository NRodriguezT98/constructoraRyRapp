-- Activar requisitos de Boleta de Registro para Subsidios
UPDATE requisitos_fuentes_pago_config
SET activo = true
WHERE titulo ILIKE '%boleta%registro%'
  AND tipo_fuente IN ('Subsidio Mi Casa Ya', 'Subsidio Caja de Compensación', 'Subsidio Caja Compensación');

-- Ver resultado
SELECT
  tipo_fuente,
  titulo,
  alcance,
  activo
FROM requisitos_fuentes_pago_config
WHERE titulo ILIKE '%boleta%registro%'
ORDER BY tipo_fuente;
