-- ============================================
-- VISTA: Documentos Pendientes en Tiempo Real
-- ============================================
-- Calcula pendientes consultando requisitos_fuentes_pago_config
-- y verificando qué documentos NO existen en documentos_cliente
-- ============================================

-- 1. Eliminar vista si existe (para poder recrearla)
DROP VIEW IF EXISTS vista_documentos_pendientes_fuentes CASCADE;

-- 2. Crear vista optimizada
CREATE OR REPLACE VIEW vista_documentos_pendientes_fuentes AS
SELECT
  -- IDs principales
  fp.id as fuente_pago_id,
  n.cliente_id,
  rfc.id as requisito_config_id,

  -- Info del requisito
  rfc.titulo as tipo_documento,
  rfc.tipo_documento_sugerido as tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.orden as prioridad,
  rfc.descripcion,

  -- Info de la fuente
  fp.tipo as tipo_fuente,
  fp.entidad,
  fp.monto_aprobado,
  tfpc.id as tipo_fuente_db_id,
  tfpc.nombre as tipo_fuente_nombre,

  -- Metadata para UI
  jsonb_build_object(
    'tipo_fuente', fp.tipo,
    'entidad', COALESCE(fp.entidad, ''),
    'monto_aprobado', fp.monto_aprobado,
    'nivel_validacion', rfc.nivel_validacion,
    'tipo_documento_sistema', rfc.tipo_documento_sugerido,
  'Pendiente' as estado,

  -- Prioridad mapeada
  CASE
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OPCIONAL' THEN 'Media'
    ELSE 'Baja'
  END as prioridad_calculada,

  -- Timestamps
  fp.fecha_creacion,
  NOW() as fecha_calculo

FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN tipos_fuentes_pago tfpc ON tfpc.id = fp.tipo_fuente_id
JOIN requisitos_fuentes_pago_config rfc
  ON rfc.tipo_fuente = fp.tipo
  AND rfc.activo = true
  AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')

-- LEFT JOIN para verificar si ya existe el documento
LEFT JOIN documentos_cliente dc
  ON dc.fuente_pago_relacionada = fp.id
  AND dc.tipo_documento = rfc.tipo_documento_sugerido
  AND dc.id IS NULL; -- Solo incluir los que NO tienen documento subido

-- 3. Comentar vista
COMMENT ON VIEW vista_documentos_pendientes_fuentes IS
'Vista en tiempo real de documentos pendientes por fuente de pago.
Calcula dinámicamente qué requisitos faltan comparando requisitos_fuentes_pago_config
con documentos_cliente.fuente_pago_relacionada';

-- 4. Crear índices en tablas relacionadas para performance
CREATE INDEX IF NOT EXISTS idx_documentos_cliente_fuente_tipo
ON documentos_cliente(fuente_pago_relacionada, tipo_documento, estado)
WHERE estado = 'Activo';

CREATE INDEX IF NOT EXISTS idx_requisitos_fuentes_tipo_activo
ON requisitos_fuentes_pago_config(tipo_fuente, activo)
WHERE activo = true;

-- 5. Función helper para obtener pendientes de un cliente
CREATE OR REPLACE FUNCTION obtener_pendientes_cliente(p_cliente_id UUID)
RETURNS TABLE (
  fuente_pago_id UUID,
  tipo_documento TEXT,
  nivel_validacion TEXT,
  prioridad TEXT,
  tipo_fuente TEXT,
  entidad TEXT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.fuente_pago_id,
    v.tipo_documento,
    v.nivel_validacion,
    v.prioridad_calculada as prioridad,
    v.tipo_fuente,
    v.entidad,
    v.metadata
  FROM vista_documentos_pendientes_fuentes v
  WHERE v.cliente_id = p_cliente_id
  ORDER BY
    CASE v.nivel_validacion
      WHEN 'DOCUMENTO_OBLIGATORIO' THEN 1
      WHEN 'DOCUMENTO_OPCIONAL' THEN 2
      ELSE 3
    END,
    v.prioridad DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Función helper para contar pendientes por fuente
CREATE OR REPLACE FUNCTION contar_pendientes_por_fuente(p_fuente_id UUID)
RETURNS TABLE (
  total INTEGER,
  obligatorios INTEGER,
  opcionales INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total,
    COUNT(*) FILTER (WHERE nivel_validacion = 'DOCUMENTO_OBLIGATORIO')::INTEGER as obligatorios,
    COUNT(*) FILTER (WHERE nivel_validacion = 'DOCUMENTO_OPCIONAL')::INTEGER as opcionales
  FROM vista_documentos_pendientes_fuentes
  WHERE fuente_pago_id = p_fuente_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver todos los pendientes
SELECT
  c.nombres || ' ' || c.apellidos as cliente,
  v.tipo_fuente,
  v.entidad,
  v.tipo_documento,
  v.nivel_validacion,
  v.prioridad_calculada
FROM vista_documentos_pendientes_fuentes v
JOIN clientes c ON c.id = v.cliente_id
ORDER BY c.apellidos, v.tipo_fuente, v.nivel_validacion;

-- Contar pendientes por cliente
SELECT
  c.nombres || ' ' || c.apellidos as cliente,
  COUNT(*) as total_pendientes,
  COUNT(*) FILTER (WHERE v.nivel_validacion = 'DOCUMENTO_OBLIGATORIO') as obligatorios,
  COUNT(*) FILTER (WHERE v.nivel_validacion = 'DOCUMENTO_OPCIONAL') as opcionales
FROM vista_documentos_pendientes_fuentes v
JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.id, c.nombres, c.apellidos
ORDER BY total_pendientes DESC;

-- Probar función helper
SELECT * FROM obtener_pendientes_cliente(
  (SELECT id FROM clientes WHERE nombres ILIKE '%pedrito%' LIMIT 1)
);
