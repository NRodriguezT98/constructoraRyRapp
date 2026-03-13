-- ============================================
-- MIGRACIÓN: Pedrito Pérez García al sistema de pendientes
-- ============================================

-- 1. Identificar Pedrito y sus fuentes activas
DO $$
DECLARE
  v_cliente_id UUID;
  v_cliente_nombre TEXT;
  v_fuente RECORD;
  v_requisito RECORD;
  v_doc_existe BOOLEAN;
BEGIN
  -- Buscar Pedrito por cédula
  SELECT id, nombres || ' ' || apellidos
  INTO v_cliente_id, v_cliente_nombre
  FROM clientes
  WHERE numero_documento = '1233333';

  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION '❌ No se encontró cliente con CC 1233333';
  END IF;

  RAISE NOTICE '✅ Cliente encontrado: % (ID: %)', v_cliente_nombre, v_cliente_id;

  -- Listar fuentes activas
  RAISE NOTICE '';
  RAISE NOTICE '📋 FUENTES ACTIVAS:';
  FOR v_fuente IN
    SELECT
      fp.id,
      fp.tipo,
      fp.entidad,
      fp.monto_aprobado,
      COUNT(dc.id) as docs_subidos
    FROM fuentes_pago fp
    JOIN negociaciones n ON n.id = fp.negociacion_id
    LEFT JOIN documentos_cliente dc ON dc.fuente_pago_relacionada = fp.id
    WHERE n.cliente_id = v_cliente_id
      AND fp.estado = 'Activa'
    GROUP BY fp.id, fp.tipo, fp.entidad, fp.monto_aprobado
  LOOP
    RAISE NOTICE '  🏦 % - % (% docs subidos)', v_fuente.tipo, v_fuente.entidad, v_fuente.docs_subidos;

    -- Verificar requisitos para este tipo
    RAISE NOTICE '     Requisitos configurados:';
    FOR v_requisito IN
      SELECT
        titulo,
        tipo_documento_sugerido,
        nivel_validacion
      FROM requisitos_fuentes_pago_config
      WHERE tipo_fuente = v_fuente.tipo
        AND activo = true
      ORDER BY orden
    LOOP
      -- Verificar si ya existe documento
      SELECT EXISTS(
        SELECT 1 FROM documentos_cliente dc
        WHERE dc.fuente_pago_relacionada = v_fuente.id
          AND dc.cliente_id = v_cliente_id
          AND (dc.tipo_documento = v_requisito.tipo_documento_sugerido
               OR dc.tipo_documento = v_requisito.titulo)
          AND dc.estado = 'Activo'
      ) INTO v_doc_existe;

      IF v_doc_existe THEN
        RAISE NOTICE '       ✅ %: Ya subido', v_requisito.titulo;
      ELSE
        RAISE NOTICE '       ⏳ %: PENDIENTE (%)', v_requisito.titulo, v_requisito.nivel_validacion;
      END IF;
    END LOOP;

    RAISE NOTICE '';
  END LOOP;

  -- Resumen de vista
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMEN DE VISTA vista_documentos_pendientes_fuentes:';
  RAISE NOTICE '   Total pendientes para este cliente: %', (
    SELECT COUNT(*)
    FROM vista_documentos_pendientes_fuentes
    WHERE cliente_id = v_cliente_id
  );

END $$;

-- 2. Mostrar resultados de la vista para Pedrito
SELECT
  'DOCUMENTOS PENDIENTES CALCULADOS' as seccion,
  vpf.tipo_documento,
  vpf.tipo_fuente,
  vpf.entidad,
  vpf.nivel_validacion,
  vpf.prioridad,
  vpf.metadata
FROM vista_documentos_pendientes_fuentes vpf
JOIN clientes c ON c.id = vpf.cliente_id
WHERE c.numero_documento = '1233333'
ORDER BY vpf.nivel_validacion, vpf.tipo_fuente;

-- 3. Verificar documentos ya subidos
SELECT
  'DOCUMENTOS YA SUBIDOS' as seccion,
  dc.titulo,
  dc.tipo_documento,
  fp.tipo as tipo_fuente,
  fp.entidad
FROM documentos_cliente dc
JOIN fuentes_pago fp ON fp.id = dc.fuente_pago_relacionada
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN clientes c ON c.id = n.cliente_id
WHERE c.numero_documento = '1233333'
  AND dc.estado = 'Activo'
ORDER BY fp.tipo, dc.tipo_documento;
