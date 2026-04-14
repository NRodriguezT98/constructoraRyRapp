-- Diagnóstico: audit_log negociaciones + evento descuento Stefany Pazos
-- Usa RAISE NOTICE para que ejecutar-sql.js muestre los resultados

DO $$
DECLARE
  v_total int;
  v_con_cliente_id int;
  v_sin_cliente_id int;
  v_row record;
  v_trigger_exists boolean := false;
BEGIN
  -- 1. Conteos generales
  SELECT COUNT(*) INTO v_total FROM audit_log WHERE tabla = 'negociaciones';
  RAISE NOTICE '=== AUDIT_LOG NEGOCIACIONES ===';
  RAISE NOTICE 'Total filas en audit_log para negociaciones: %', v_total;

  SELECT COUNT(*) INTO v_con_cliente_id
  FROM audit_log
  WHERE tabla = 'negociaciones'
    AND metadata->>'cliente_id' IS NOT NULL;
  RAISE NOTICE 'Con cliente_id en metadata: %', v_con_cliente_id;

  SELECT COUNT(*) INTO v_sin_cliente_id
  FROM audit_log
  WHERE tabla = 'negociaciones'
    AND (metadata IS NULL OR metadata = '{}'::jsonb OR metadata->>'cliente_id' IS NULL);
  RAISE NOTICE 'Sin cliente_id en metadata (vacíos): %', v_sin_cliente_id;

  -- 2. Eventos que cambiaron descuento_aplicado (los últimos 10)
  RAISE NOTICE '=== EVENTOS CON DESCUENTO_APLICADO ===';
  FOR v_row IN (
    SELECT
      id,
      fecha_evento,
      usuario_email,
      metadata->>'cliente_id'        AS cliente_id,
      datos_nuevos->>'descuento_aplicado' AS descuento_nuevo,
      datos_anteriores->>'descuento_aplicado' AS descuento_anterior,
      (cambios_especificos ? 'descuento_aplicado') AS tiene_cambio
    FROM audit_log
    WHERE tabla = 'negociaciones'
      AND (
        datos_nuevos ? 'descuento_aplicado'
        OR cambios_especificos ? 'descuento_aplicado'
      )
    ORDER BY fecha_evento DESC
    LIMIT 10
  ) LOOP
    RAISE NOTICE 'id=% | fecha=% | user=% | cliente_id=% | desc_ant=% -> desc_nuevo=%',
      v_row.id,
      v_row.fecha_evento,
      v_row.usuario_email,
      COALESCE(v_row.cliente_id, 'NULL'),
      COALESCE(v_row.descuento_anterior, 'NULL'),
      COALESCE(v_row.descuento_nuevo, 'NULL');
  END LOOP;

  -- 3. Últimas 5 filas de audit_log para negociaciones (cualquier tipo)
  RAISE NOTICE '=== ÚLTIMAS 5 FILAS DE NEGOCIACIONES EN AUDIT_LOG ===';
  FOR v_row IN (
    SELECT
      id,
      fecha_evento,
      accion,
      usuario_email,
      metadata->>'cliente_id' AS cliente_id,
      metadata
    FROM audit_log
    WHERE tabla = 'negociaciones'
    ORDER BY fecha_evento DESC
    LIMIT 5
  ) LOOP
    RAISE NOTICE 'id=% | % | accion=% | user=% | cliente_id=% | metadata=%',
      v_row.id,
      v_row.fecha_evento,
      v_row.accion,
      v_row.usuario_email,
      COALESCE(v_row.cliente_id, 'NULL'),
      v_row.metadata::text;
  END LOOP;

  -- 4. Verificar trigger
  RAISE NOTICE '=== TRIGGER ===';
  SELECT EXISTS(
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'negociaciones_audit_trigger'
  ) INTO v_trigger_exists;

  IF v_trigger_exists THEN
    RAISE NOTICE 'Trigger negociaciones_audit_trigger: EXISTE ✓';
  ELSE
    RAISE NOTICE 'Trigger negociaciones_audit_trigger: NO EXISTE ✗';
  END IF;

  -- Verificar a qué función apunta
  FOR v_row IN (
    SELECT t.tgname, p.proname AS funcion
    FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE t.tgname LIKE '%negociacion%'
  ) LOOP
    RAISE NOTICE 'Trigger % apunta a función: %', v_row.tgname, v_row.funcion;
  END LOOP;

END $$;
