-- Verificar requisitos configurados
SELECT
  id,
  tipo_fuente,
  titulo,
  tipo_documento_sugerido,
  nivel_validacion,
  activo
FROM requisitos_fuentes_pago_config
WHERE activo = true
ORDER BY tipo_fuente, orden;
