-- ============================================
-- MIGRACIÓN: Crear fuente activa para Pedrito
-- ============================================

DO $$
DECLARE
  v_cliente_id UUID := '8dfeba01-ac6e-4f15-9561-e7039a417beb'; -- Pedrito
  v_negociacion_id UUID;
  v_fuente_id UUID;
  v_tipo_fuente_id UUID;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚀 MIGRACIÓN: Crear fuente activa para Pedrito';
  RAISE NOTICE '';

  -- 1. Buscar negociación activa de Pedrito
  SELECT id INTO v_negociacion_id
  FROM negociaciones
  WHERE cliente_id = v_cliente_id
    AND estado IN ('Activa', 'En Proceso')
  ORDER BY fecha_negociacion DESC
  LIMIT 1;

  IF v_negociacion_id IS NULL THEN
    RAISE EXCEPTION '❌ Pedrito no tiene negociaciones activas';
  END IF;

  RAISE NOTICE '✅ Negociación encontrada: %', v_negociacion_id;

  -- 2. Buscar tipo de fuente "Crédito Bancario" o crear una nueva
  SELECT id INTO v_tipo_fuente_id
  FROM tipos_fuentes_pago
  WHERE nombre = 'Crédito Bancario'
  LIMIT 1;

  IF v_tipo_fuente_id IS NULL THEN
    -- Buscar cualquier tipo disponible
    SELECT id INTO v_tipo_fuente_id
    FROM tipos_fuentes_pago
    LIMIT 1;
  END IF;

  IF v_tipo_fuente_id IS NULL THEN
    RAISE EXCEPTION '❌ No hay tipos de fuentes de pago en el sistema';
  END IF;

  RAISE NOTICE '✅ Tipo de fuente: %', v_tipo_fuente_id;

  -- 3. Verificar si ya tiene fuente activa
  SELECT id INTO v_fuente_id
  FROM fuentes_pago
  WHERE negociacion_id = v_negociacion_id
    AND estado IN ('En Proceso', 'Completada')
  LIMIT 1;

  IF v_fuente_id IS NOT NULL THEN
    RAISE NOTICE '⚠️ Ya existe fuente activa: %', v_fuente_id;
    RAISE NOTICE '   Usando fuente existente...';
  ELSE
    -- 4. Crear fuente de pago activa
    INSERT INTO fuentes_pago (
      negociacion_id,
      tipo_fuente_id,
      tipo,
      entidad,
      monto_aprobado,
      estado,
      fecha_creacion
    )
    VALUES (
      v_negociacion_id,
      v_tipo_fuente_id,
      'Crédito Bancario',
      'Banco de Bogotá',
      50000000, -- $50M para prueba
      'En Proceso', -- ← Estados válidos: 'Pendiente' | 'En Proceso' | 'Completada'
      NOW()
    )
    RETURNING id INTO v_fuente_id;

    RAISE NOTICE '✅ Fuente creada: %', v_fuente_id;
    RAISE NOTICE '   Tipo: Crédito Bancario';
    RAISE NOTICE '   Entidad: Banco de Bogotá';
    RAISE NOTICE '   Monto: $50.000.000';
    RAISE NOTICE '   Estado: En Proceso';
  END IF;

  -- 5. Verificar requisitos configurados
  DECLARE
    v_requisito RECORD;
  BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 Verificando requisitos para "Crédito Bancario":';

    FOR v_requisito IN (
      SELECT titulo, nivel_validacion
      FROM requisitos_fuentes_pago_config
      WHERE tipo_fuente = 'Crédito Bancario'
        AND activo = true
      ORDER BY orden
    ) LOOP
      RAISE NOTICE '   %: % (%)',
        CASE WHEN v_requisito.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN '🔴' ELSE '🔵' END,
        v_requisito.titulo,
        v_requisito.nivel_validacion;
    END LOOP;
  END;

  -- 6. Contar pendientes
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESULTADO FINAL:';
  RAISE NOTICE '   Documentos pendientes en vista: %', (
    SELECT COUNT(*)
    FROM vista_documentos_pendientes_fuentes
    WHERE cliente_id = v_cliente_id
  );

  RAISE NOTICE '';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA';
  RAISE NOTICE '';

END $$;

-- Mostrar pendientes de Pedrito
SELECT
  'DOCUMENTOS PENDIENTES PARA PEDRITO' as info,
  tipo_documento,
  tipo_fuente,
  entidad,
  nivel_validacion,
  prioridad
FROM vista_documentos_pendientes_fuentes
WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY nivel_validacion, tipo_documento;
