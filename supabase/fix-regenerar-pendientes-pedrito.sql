-- ============================================
-- FIX: Regenerar pendientes para Pedrito
-- ============================================

-- 1. Ver fuentes de Pedrito
SELECT
  fp.id,
  fp.tipo,
  fp.entidad,
  fp.tipo_fuente_id,
  fp.estado,
  c.nombres || ' ' || c.apellidos as cliente
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN clientes c ON c.id = n.cliente_id
WHERE c.nombres ILIKE '%pedrito%'
  AND fp.estado = 'Activa';

-- 2. Ver requisitos disponibles para Mi Casa Ya
SELECT
  rfc.id,
  rfc.titulo,
  rfc.tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.activo,
  tf.nombre as tipo_fuente
FROM requisitos_fuentes_pago_config rfc
JOIN tipos_fuentes_pago tf ON tf.id = rfc.tipo_fuente_id
WHERE tf.nombre ILIKE '%mi casa ya%'
  AND rfc.activo = true;

-- 3. Ver pendientes actuales de Pedrito
SELECT
  dp.id,
  dp.tipo_documento,
  dp.estado,
  dp.prioridad,
  dp.metadata,
  fp.tipo as fuente_tipo
FROM documentos_pendientes dp
JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN clientes c ON c.id = n.cliente_id
WHERE c.nombres ILIKE '%pedrito%';

-- 4. LIMPIAR pendientes viejos de Pedrito
DELETE FROM documentos_pendientes
WHERE cliente_id IN (
  SELECT id FROM clientes WHERE nombres ILIKE '%pedrito%'
);

-- 5. REGENERAR pendientes usando función helper
DO $$
DECLARE
  v_fuente RECORD;
  v_pendientes INTEGER;
BEGIN
  -- Para cada fuente activa de Pedrito
  FOR v_fuente IN
    SELECT fp.id, fp.tipo, c.nombres || ' ' || c.apellidos as cliente
    FROM fuentes_pago fp
    JOIN negociaciones n ON n.id = fp.negociacion_id
    JOIN clientes c ON c.id = n.cliente_id
    WHERE c.nombres ILIKE '%pedrito%'
      AND fp.estado = 'Activa'
  LOOP
    -- Regenerar pendientes
    v_pendientes := regenerar_pendientes_fuente(v_fuente.id);

    RAISE NOTICE 'Fuente: % - Cliente: % - Pendientes creados: %',
      v_fuente.tipo,
      v_fuente.cliente,
      v_pendientes;
  END LOOP;
END $$;

-- 6. Verificar resultado final
SELECT
  fp.tipo as fuente,
  fp.entidad,
  dp.tipo_documento,
  dp.metadata->>'nivel_validacion' as nivel,
  dp.prioridad,
  dp.estado
FROM documentos_pendientes dp
JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN clientes c ON c.id = n.cliente_id
WHERE c.nombres ILIKE '%pedrito%'
ORDER BY dp.prioridad DESC;
