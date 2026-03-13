-- Verificar requisitos configurados para Crédito Hipotecario
SELECT
  id,
  tipo_fuente,
  paso_identificador,
  titulo,
  tipo_documento_sugerido,
  nivel_validacion,
  orden,
  activo
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente = 'Crédito Hipotecario'
  AND activo = true
ORDER BY orden;

-- Ver cuántos pasos tiene cada fuente de Crédito Hipotecario
SELECT
  fp.id,
  fp.tipo,
  COUNT(pfp.id) AS total_pasos
FROM fuentes_pago fp
LEFT JOIN pasos_fuente_pago pfp ON pfp.fuente_pago_id = fp.id
WHERE fp.tipo = 'Crédito Hipotecario'
GROUP BY fp.id, fp.tipo;

-- Ver detalles de los pasos existentes
SELECT
  pfp.id,
  pfp.fuente_pago_id,
  pfp.paso,
  pfp.titulo,
  pfp.tipo_documento_requerido,
  pfp.completado
FROM pasos_fuente_pago pfp
INNER JOIN fuentes_pago fp ON fp.id = pfp.fuente_pago_id
WHERE fp.tipo = 'Crédito Hipotecario'
ORDER BY fp.id, pfp.fecha_creacion;
