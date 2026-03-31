-- Ver pendientes actuales de Pedrito
SELECT
  dp.id,
  dp.tipo_documento,
  dp.prioridad,
  dp.estado,
  dp.metadata->>'nivel_validacion' as nivel,
  dp.metadata->>'tipo_documento_sistema' as tipo_sistema,
  fp.tipo as fuente_tipo
FROM documentos_pendientes dp
JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
JOIN clientes c ON c.id = dp.cliente_id
WHERE c.nombres ILIKE '%pedrito%'
ORDER BY dp.fecha_creacion DESC;

-- Ver requisitos configurados para Mi Casa Ya
SELECT
  rfc.id,
  rfc.titulo,
  rfc.tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.prioridad,
  rfc.activo,
  tfc.nombre as tipo_fuente
FROM requisitos_fuentes_pago_config rfc
JOIN tipos_fuentes_pago_config tfc ON tfc.id = rfc.tipo_fuente_id
WHERE tfc.nombre ILIKE '%mi casa ya%'
ORDER BY rfc.nivel_validacion, rfc.prioridad DESC;

-- Ver fuente de Pedrito
SELECT
  fp.id,
  fp.tipo,
  fp.tipo_fuente_id,
  fp.entidad,
  fp.estado
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN clientes c ON c.id = n.cliente_id
WHERE c.nombres ILIKE '%pedrito%';
