-- Verificar requisitos configurados para Crédito Hipotecario
SELECT
  tipo_fuente,
  paso_identificador,
  titulo,
  tipo_documento_sugerido,
  nivel_validacion,
  orden,
  activo
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente = 'Crédito Hipotecario'
ORDER BY orden;

-- Verificar pasos creados
SELECT
  fp.tipo,
  COUNT(pfp.id) AS total_pasos
FROM fuentes_pago fp
LEFT JOIN pasos_fuente_pago pfp ON pfp.fuente_pago_id = fp.id
WHERE fp.tipo = 'Crédito Hipotecario'
GROUP BY fp.tipo;

-- Verificar si hay requisitos mal configurados (paso_identificador NULL o vacío)
SELECT
  COUNT(*) AS requisitos_invalidos
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente = 'Crédito Hipotecario'
  AND activo = true
  AND (paso_identificador IS NULL OR paso_identificador = '');
