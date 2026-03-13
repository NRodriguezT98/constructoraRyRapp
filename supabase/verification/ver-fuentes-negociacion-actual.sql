-- Ver fuentes de pago de la negociación actual de Pedrito
SELECT
  fp.id,
  fp.tipo,
  fp.entidad
FROM fuentes_pago fp
WHERE fp.negociacion_id = 'faa506ea-41ff-4f51-8479-21686deb93e8'
ORDER BY fp.tipo;
