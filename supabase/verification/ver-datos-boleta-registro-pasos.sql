-- Ver datos reales de pasos de Boleta de Registro
SELECT
  pfp.id,
  pfp.paso,
  pfp.titulo,
  pfp.tipo_documento_requerido,
  pfp.categoria_documento_requerida,
  fp.tipo as fuente_tipo
FROM pasos_fuente_pago pfp
JOIN fuentes_pago fp ON fp.id = pfp.fuente_pago_id
WHERE pfp.paso = 'boleta_registro'
LIMIT 5;
