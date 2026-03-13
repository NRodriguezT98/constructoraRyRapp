-- Verificar estado actual de Subsidio Caja Compensación

SELECT
  tipo_fuente,
  COUNT(*) as total,
  SUM(CASE WHEN activo THEN 1 ELSE 0 END) as activos,
  SUM(CASE WHEN NOT activo THEN 1 ELSE 0 END) as inactivos
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente ILIKE '%subsidio%caja%'
GROUP BY tipo_fuente
ORDER BY tipo_fuente;
