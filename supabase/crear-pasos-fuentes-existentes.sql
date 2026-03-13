-- Crear pasos de validación para fuentes de pago existentes que NO tienen pasos

INSERT INTO pasos_fuente_pago (
  fuente_pago_id,
  paso,
  titulo,
  descripcion,
  tipo_documento_requerido,
  categoria_documento_requerida,
  nivel_validacion,
  completado
)
SELECT
  fp.id AS fuente_pago_id,
  config.paso_identificador AS paso,
  config.titulo,
  config.descripcion,
  config.tipo_documento_sugerido AS tipo_documento_requerido,
  config.categoria_documento AS categoria_documento_requerida,
  config.nivel_validacion,
  false AS completado
FROM fuentes_pago fp
CROSS JOIN requisitos_fuentes_pago_config config
WHERE config.tipo_fuente = fp.tipo
  AND config.activo = true
  AND NOT EXISTS (
    SELECT 1
    FROM pasos_fuente_pago pfp
    WHERE pfp.fuente_pago_id = fp.id
  )
ORDER BY fp.id, config.orden;

-- Verificar cuántos pasos se crearon
SELECT
  fp.tipo,
  COUNT(pfp.id) AS total_pasos,
  SUM(CASE WHEN pfp.completado THEN 1 ELSE 0 END) AS completados
FROM fuentes_pago fp
LEFT JOIN pasos_fuente_pago pfp ON pfp.fuente_pago_id = fp.id
GROUP BY fp.tipo
ORDER BY fp.tipo;
