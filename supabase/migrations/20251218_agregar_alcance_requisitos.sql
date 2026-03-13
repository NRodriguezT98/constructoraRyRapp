-- ============================================
-- MIGRACIÓN: Agregar alcance a requisitos
-- Diferencia documentos específicos vs compartidos
-- ============================================

BEGIN;

-- 1️⃣ AGREGAR COLUMNA alcance
ALTER TABLE requisitos_fuentes_pago_config
ADD COLUMN IF NOT EXISTS alcance VARCHAR(30) DEFAULT 'ESPECIFICO_FUENTE'
CHECK (alcance IN ('ESPECIFICO_FUENTE', 'COMPARTIDO_CLIENTE'));

COMMENT ON COLUMN requisitos_fuentes_pago_config.alcance IS
'Alcance del documento:
- ESPECIFICO_FUENTE: Cada fuente necesita su propio documento (ej: Carta de Aprobación)
- COMPARTIDO_CLIENTE: Un solo documento valida para todas las fuentes (ej: Boleta de Registro)';

-- 2️⃣ MARCAR DOCUMENTOS COMPARTIDOS
-- Boleta de Registro es compartida (se usa en múltiples fuentes)
UPDATE requisitos_fuentes_pago_config
SET alcance = 'COMPARTIDO_CLIENTE'
WHERE titulo ILIKE '%boleta%registro%'
   OR tipo_documento_sugerido ILIKE '%boleta%registro%';

-- Otros documentos que suelen ser compartidos
UPDATE requisitos_fuentes_pago_config
SET alcance = 'COMPARTIDO_CLIENTE'
WHERE titulo IN (
  'Cédula de Ciudadanía',
  'Certificado de Tradición y Libertad',
  'Certificado Laboral',
  'Declaración de Renta'
);

-- 3️⃣ VERIFICAR CONFIGURACIÓN
SELECT
  'REQUISITOS POR ALCANCE' as seccion,
  alcance,
  COUNT(*) as total,
  ARRAY_AGG(DISTINCT titulo ORDER BY titulo) as documentos
FROM requisitos_fuentes_pago_config
WHERE activo = true
GROUP BY alcance;

-- 4️⃣ ACTUALIZAR VISTA CON LÓGICA DE ALCANCE
DROP VIEW IF EXISTS vista_documentos_pendientes_fuentes CASCADE;

CREATE OR REPLACE VIEW vista_documentos_pendientes_fuentes AS
WITH documentos_especificos AS (
  -- Documentos específicos: uno por fuente
  SELECT DISTINCT
    fp.id as fuente_pago_id,
    n.cliente_id,
    rfc.id as requisito_config_id,
    rfc.titulo as tipo_documento,
    rfc.tipo_documento_sugerido as tipo_documento_sistema,
    rfc.nivel_validacion,
    rfc.orden,
    rfc.descripcion,
    rfc.alcance,
    fp.tipo as tipo_fuente,
    fp.entidad,
    fp.monto_aprobado,
    jsonb_build_object(
      'tipo_fuente', fp.tipo,
      'entidad_fuente', COALESCE(fp.entidad, ''),
      'monto_aprobado', fp.monto_aprobado,
      'nivel_validacion', rfc.nivel_validacion,
      'tipo_documento_sistema', COALESCE(rfc.tipo_documento_sugerido, rfc.titulo),
      'requisito_config_id', rfc.id,
      'alcance', rfc.alcance
    ) as metadata,
    'Pendiente' as estado,
    CASE
      WHEN rfc.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
      WHEN rfc.nivel_validacion = 'DOCUMENTO_OPCIONAL' THEN 'Media'
      ELSE 'Baja'
    END as prioridad,
    fp.fecha_creacion,
    NOW() as fecha_calculo
  FROM fuentes_pago fp
  JOIN negociaciones n ON n.id = fp.negociacion_id
  JOIN requisitos_fuentes_pago_config rfc
    ON rfc.tipo_fuente = fp.tipo
    AND rfc.activo = true
    AND rfc.alcance = 'ESPECIFICO_FUENTE'
    AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
  LEFT JOIN documentos_cliente dc
    ON dc.fuente_pago_relacionada = fp.id
    AND (dc.tipo_documento = rfc.tipo_documento_sugerido OR dc.tipo_documento = rfc.titulo)
    AND dc.estado = 'Activo'
    AND dc.cliente_id = n.cliente_id
  WHERE fp.estado = 'Activa'
    AND dc.id IS NULL
),
documentos_compartidos AS (
  -- Documentos compartidos: uno para el cliente (solo mostrar una vez)
  SELECT DISTINCT ON (n.cliente_id, rfc.id)
    fp.id as fuente_pago_id,
    n.cliente_id,
    rfc.id as requisito_config_id,
    rfc.titulo as tipo_documento,
    rfc.tipo_documento_sugerido as tipo_documento_sistema,
    rfc.nivel_validacion,
    rfc.orden,
    rfc.descripcion,
    rfc.alcance,
    'Compartido' as tipo_fuente,  -- Indica que es compartido
    NULL::VARCHAR as entidad,
    NULL::NUMERIC as monto_aprobado,
    jsonb_build_object(
      'tipo_fuente', 'Compartido',
      'entidad_fuente', 'General',
      'monto_aprobado', NULL,
      'nivel_validacion', rfc.nivel_validacion,
      'tipo_documento_sistema', COALESCE(rfc.tipo_documento_sugerido, rfc.titulo),
      'requisito_config_id', rfc.id,
      'alcance', rfc.alcance,
      'fuentes_aplicables', ARRAY_AGG(fp.tipo) OVER (PARTITION BY n.cliente_id, rfc.id)
    ) as metadata,
    'Pendiente' as estado,
    CASE
      WHEN rfc.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
      WHEN rfc.nivel_validacion = 'DOCUMENTO_OPCIONAL' THEN 'Media'
      ELSE 'Baja'
    END as prioridad,
    MIN(fp.fecha_creacion) OVER (PARTITION BY n.cliente_id) as fecha_creacion,
    NOW() as fecha_calculo
  FROM fuentes_pago fp
  JOIN negociaciones n ON n.id = fp.negociacion_id
  JOIN requisitos_fuentes_pago_config rfc
    ON rfc.activo = true
    AND rfc.alcance = 'COMPARTIDO_CLIENTE'
    AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
  LEFT JOIN documentos_cliente dc
    ON dc.cliente_id = n.cliente_id
    AND (dc.tipo_documento = rfc.tipo_documento_sugerido OR dc.tipo_documento = rfc.titulo)
    AND dc.estado = 'Activo'
  WHERE fp.estado = 'Activa'
    AND dc.id IS NULL
)
SELECT * FROM documentos_especificos
UNION ALL
SELECT * FROM documentos_compartidos
ORDER BY prioridad DESC, tipo_documento;

COMMENT ON VIEW vista_documentos_pendientes_fuentes IS
'Vista de documentos pendientes con soporte para alcance:
- ESPECIFICO_FUENTE: Un pendiente por cada fuente (ej: Carta de Aprobación)
- COMPARTIDO_CLIENTE: Un solo pendiente para el cliente (ej: Boleta de Registro)';

-- 5️⃣ TEST: Verificar que Boleta de Registro aparezca solo UNA VEZ
SELECT
  'TEST PEDRITO' as seccion,
  tipo_documento,
  alcance,
  tipo_fuente,
  COUNT(*) as veces_aparece
FROM vista_documentos_pendientes_fuentes
WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
GROUP BY tipo_documento, alcance, tipo_fuente
ORDER BY alcance DESC, tipo_documento;

COMMIT;
