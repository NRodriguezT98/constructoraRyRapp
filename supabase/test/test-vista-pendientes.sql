-- ============================================
-- TEST: Vista Documentos Pendientes (Pedrito)
-- ============================================

-- 1. Verificar fuentes activas
SELECT
  'FUENTES ACTIVAS' as test,
  fp.id,
  fp.tipo,
  fp.entidad,
  fp.estado,
  fp.negociacion_id
FROM fuentes_pago fp
WHERE fp.estado = 'Activa'
ORDER BY fp.id DESC
LIMIT 5;

-- 2. Verificar requisitos configurados
SELECT
  'REQUISITOS POR TIPO' as test,
  rfc.tipo_fuente,
  COUNT(*) as total_requisitos,
  SUM(CASE WHEN rfc.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 1 ELSE 0 END) as obligatorios,
  SUM(CASE WHEN rfc.nivel_validacion = 'DOCUMENTO_OPCIONAL' THEN 1 ELSE 0 END) as opcionales
FROM requisitos_fuentes_pago_config rfc
WHERE rfc.activo = true
GROUP BY rfc.tipo_fuente
ORDER BY rfc.tipo_fuente;

-- 3. Probar vista
SELECT
  'VISTA PENDIENTES' as test,
  vpf.cliente_id,
  vpf.fuente_pago_id,
  vpf.tipo_documento,
  vpf.nivel_validacion,
  vpf.prioridad,
  vpf.metadata->'tipo_fuente' as tipo_fuente,
  vpf.metadata->'entidad_fuente' as entidad
FROM vista_documentos_pendientes_fuentes vpf
LIMIT 10;

-- 4. Contar total por nivel
SELECT
  'RESUMEN POR NIVEL' as test,
  nivel_validacion,
  COUNT(*) as total
FROM vista_documentos_pendientes_fuentes
GROUP BY nivel_validacion
ORDER BY nivel_validacion;

-- 5. Diagnóstico: Fuentes sin documentos
SELECT
  'FUENTES SIN DOCS' as test,
  fp.id as fuente_id,
  fp.tipo as tipo_fuente,
  COUNT(dc.id) as docs_subidos
FROM fuentes_pago fp
LEFT JOIN documentos_cliente dc ON dc.fuente_pago_relacionada = fp.id
WHERE fp.estado = 'Activa'
GROUP BY fp.id, fp.tipo
HAVING COUNT(dc.id) = 0
LIMIT 5;

-- 6. Requisitos activos por tipo
SELECT
  'REQUISITOS ACTIVOS' as test,
  tipo_fuente,
  COUNT(*) as total_requisitos
FROM requisitos_fuentes_pago_config
WHERE activo = true
GROUP BY tipo_fuente;
