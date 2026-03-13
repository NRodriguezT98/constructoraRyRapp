-- Ver configuración actual de requisitos para Boleta de Registro
SELECT
  id,
  tipo_fuente,
  paso_identificador,
  titulo,
  descripcion,
  tipo_documento_sugerido,
  categoria_documento,
  orden,
  activo
FROM requisitos_fuentes_pago_config
WHERE paso_identificador = 'boleta_registro'
ORDER BY tipo_fuente, orden;
