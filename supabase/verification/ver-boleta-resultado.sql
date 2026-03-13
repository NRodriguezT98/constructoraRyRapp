-- Ver configuración actual de Boleta de Registro después de la corrección
SELECT
  tipo_fuente,
  titulo,
  alcance,
  nivel_validacion,
  categoria_documento,
  activo,
  orden
FROM requisitos_fuentes_pago_config
WHERE paso_identificador = 'boleta_registro'
  OR titulo ILIKE '%boleta%registro%'
ORDER BY tipo_fuente;
