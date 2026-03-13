-- ============================================
-- BUSCAR CLIENTES IDEALES PARA TESTING
-- ============================================

-- 1. Clientes con fuentes activas y sus documentos
SELECT
  c.id as cliente_id,
  c.nombres || ' ' || c.apellidos as cliente_nombre,
  fp.id as fuente_id,
  fp.tipo as tipo_fuente,
  fp.entidad,
  fp.estado as estado_fuente,
  COUNT(dc.id) as docs_subidos,
  STRING_AGG(DISTINCT dc.tipo_documento, ', ') as tipos_documentos_subidos
FROM clientes c
JOIN negociaciones n ON n.cliente_id = c.id
JOIN fuentes_pago fp ON fp.negociacion_id = n.id
LEFT JOIN documentos_cliente dc ON dc.fuente_pago_relacionada = fp.id AND dc.estado = 'Activo'
WHERE fp.estado = 'Activa'
GROUP BY c.id, c.nombres, c.apellidos, fp.id, fp.tipo, fp.entidad, fp.estado
ORDER BY docs_subidos DESC, c.apellidos
LIMIT 10;

-- 2. Requisitos configurados por tipo de fuente
SELECT
  tipo_fuente,
  COUNT(*) as total_requisitos,
  STRING_AGG(titulo, ', ' ORDER BY orden) as requisitos
FROM requisitos_fuentes_pago_config
WHERE activo = true
GROUP BY tipo_fuente
ORDER BY tipo_fuente;

-- 3. Tipos de fuentes activas vs requisitos configurados
SELECT DISTINCT
  fp.tipo as tipo_fuente_activo,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM requisitos_fuentes_pago_config rfc
      WHERE rfc.tipo_fuente = fp.tipo AND rfc.activo = true
    ) THEN '✅ Tiene requisitos'
    ELSE '❌ Sin requisitos'
  END as tiene_requisitos,
  COUNT(fp.id) as total_fuentes
FROM fuentes_pago fp
WHERE fp.estado = 'Activa'
GROUP BY fp.tipo
ORDER BY total_fuentes DESC;
