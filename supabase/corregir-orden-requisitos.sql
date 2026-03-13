-- Corregir el orden de los requisitos de Crédito Hipotecario

UPDATE requisitos_fuentes_pago_config
SET orden = 1
WHERE tipo_fuente = 'Crédito Hipotecario'
  AND paso_identificador = 'boleta_registro';

UPDATE requisitos_fuentes_pago_config
SET orden = 2
WHERE tipo_fuente = 'Crédito Hipotecario'
  AND paso_identificador = 'carta_aprobacion_credito';

UPDATE requisitos_fuentes_pago_config
SET orden = 3
WHERE tipo_fuente = 'Crédito Hipotecario'
  AND paso_identificador = 'solicitud_desembolso';

-- Verificar resultado
SELECT
  tipo_fuente,
  orden,
  paso_identificador,
  titulo,
  nivel_validacion
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente = 'Crédito Hipotecario'
ORDER BY orden;
