-- Ver qué requisitos están configurados y su alcance
SELECT
  tipo_fuente,
  titulo,
  alcance,
  nivel_validacion,
  activo
FROM requisitos_fuentes_pago_config
WHERE titulo ILIKE '%boleta%'
ORDER BY tipo_fuente, titulo;
