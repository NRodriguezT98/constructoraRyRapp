-- ============================================
-- MIGRACIÓN: Simplificar estados de fuentes_pago
-- De: Pendiente | En Proceso | Completada
-- A: Activa | Inactiva
-- ============================================

BEGIN;

-- 1️⃣ DIAGNÓSTICO: Ver estados actuales
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 ESTADOS ACTUALES:';
  RAISE NOTICE '';
END $$;

SELECT
  estado,
  COUNT(*) as total,
  ARRAY_AGG(DISTINCT tipo ORDER BY tipo) as tipos_fuentes
FROM fuentes_pago
GROUP BY estado
ORDER BY total DESC;

-- 2️⃣ ELIMINAR CONSTRAINT ANTIGUO PRIMERO
ALTER TABLE fuentes_pago
DROP CONSTRAINT IF EXISTS fuentes_pago_estado_check;

-- 3️⃣ MIGRAR DATOS A NUEVOS ESTADOS
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔄 MIGRANDO DATOS...';
  RAISE NOTICE '';
END $$;

-- Lógica de migración:
-- 'Pendiente' → 'Inactiva' (no aplicó con esa fuente)
-- 'En Proceso' → 'Activa' (está usando esta fuente)
-- 'Completada' → 'Activa' (usó/completó esta fuente)
UPDATE fuentes_pago
SET estado = CASE
  WHEN estado = 'Pendiente' THEN 'Inactiva'
  WHEN estado = 'En Proceso' THEN 'Activa'
  WHEN estado = 'Completada' THEN 'Activa'
  ELSE estado
END;

-- 4️⃣ CREAR NUEVO CONSTRAINT
ALTER TABLE fuentes_pago
ADD CONSTRAINT fuentes_pago_estado_check
CHECK (estado IN ('Activa', 'Inactiva'));

-- 5️⃣ ACTUALIZAR VISTA SQL
DROP VIEW IF EXISTS vista_documentos_pendientes_fuentes CASCADE;

CREATE OR REPLACE VIEW vista_documentos_pendientes_fuentes AS
SELECT
  fp.id as fuente_pago_id,
  n.cliente_id,
  rfc.id as requisito_config_id,
  rfc.titulo as tipo_documento,
  rfc.tipo_documento_sugerido as tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.orden,
  rfc.descripcion,
  fp.tipo as tipo_fuente,
  fp.entidad,
  fp.monto_aprobado,
  jsonb_build_object(
    'tipo_fuente', fp.tipo,
    'entidad_fuente', COALESCE(fp.entidad, ''),
    'monto_aprobado', fp.monto_aprobado,
    'nivel_validacion', rfc.nivel_validacion,
    'tipo_documento_sistema', COALESCE(rfc.tipo_documento_sugerido, rfc.titulo),
    'requisito_config_id', rfc.id
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
  AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
LEFT JOIN documentos_cliente dc
  ON dc.fuente_pago_relacionada = fp.id
  AND (dc.tipo_documento = rfc.tipo_documento_sugerido OR dc.tipo_documento = rfc.titulo)
  AND dc.estado = 'Activo'
  AND dc.cliente_id = n.cliente_id
WHERE fp.estado = 'Activa'  -- ✅ NUEVO: Solo fuentes activas
  AND dc.id IS NULL;

COMMENT ON VIEW vista_documentos_pendientes_fuentes IS
'Vista en tiempo real de documentos pendientes por fuente de pago activa.
Estados válidos: Activa (cliente aplicó con esta fuente) | Inactiva (no la usa)';

-- 6️⃣ VERIFICAR MIGRACIÓN
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA';
  RAISE NOTICE '';
  RAISE NOTICE '📊 NUEVOS ESTADOS:';
  RAISE NOTICE '';
END $$;

SELECT
  'RESUMEN FINAL' as seccion,
  estado,
  COUNT(*) as total
FROM fuentes_pago
GROUP BY estado
ORDER BY estado;

-- 7️⃣ TEST: Ver pendientes de Pedrito
SELECT
  'PENDIENTES PEDRITO' as seccion,
  COUNT(*) as total_pendientes
FROM vista_documentos_pendientes_fuentes
WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb';

SELECT
  'DETALLE PEDRITO' as seccion,
  tipo_documento,
  tipo_fuente,
  entidad,
  nivel_validacion
FROM vista_documentos_pendientes_fuentes
WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY nivel_validacion, tipo_fuente
LIMIT 10;

COMMIT;
