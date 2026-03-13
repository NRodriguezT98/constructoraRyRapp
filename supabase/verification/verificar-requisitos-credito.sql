-- Verificar requisitos configurados para Crédito Hipotecario
SELECT
  id,
  tipo_fuente,
  paso_identificador,
  titulo,
  orden,
  nivel_validacion,
  activo
FROM public.requisitos_fuentes_pago_config
WHERE tipo_fuente = 'Crédito Hipotecario'
  AND activo = true
ORDER BY orden ASC;
