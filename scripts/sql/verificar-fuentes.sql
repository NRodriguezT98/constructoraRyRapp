-- Verificar configuración de requiere_entidad en tipos_fuentes_pago
SELECT
  nombre,
  codigo,
  requiere_entidad,
  activo,
  orden
FROM tipos_fuentes_pago
ORDER BY orden;
