-- Ver qué se está guardando REALMENTE en fuentes_pago.entidad
SELECT
  fp.id,
  fp.tipo,
  fp.entidad as "UUID en fuentes_pago",
  ef.nombre as "Nombre en entidades_financieras"
FROM fuentes_pago fp
LEFT JOIN entidades_financieras ef ON fp.entidad::uuid = ef.id
WHERE fp.negociacion_id IN (
  SELECT id FROM negociaciones WHERE cliente_id = 'ec2c8e2e-a877-4a8a-a067-88d2efb40098'::uuid
)
ORDER BY fp.tipo;
