-- ============================================================
-- RPC: rebalancear_plan_financiero
-- ============================================================
-- Ejecuta TODO el rebalanceo en una sola transacción atómica.
-- Si cualquier paso falla, NADA se persiste.
--
-- Uso desde frontend:
--   await supabase.rpc('rebalancear_plan_financiero', { p_payload: {...} })
-- ============================================================

CREATE OR REPLACE FUNCTION public.rebalancear_plan_financiero(
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_negociacion_id uuid;
  v_usuario_id uuid;
  v_motivo text;
  v_notas text;
  v_valor_vivienda numeric;
  v_cliente_id uuid;
  v_ajuste jsonb;
  v_nueva jsonb;
  v_ajuste_id uuid;
  v_ajuste_tipo text;
  v_ajuste_monto_original numeric;
  v_ajuste_monto_nuevo numeric;
  v_ajuste_entidad_original text;
  v_ajuste_entidad_nueva text;
  v_ajuste_eliminar boolean;
  v_nueva_tipo text;
  v_nueva_monto numeric;
  v_nueva_entidad text;
  v_tipo_fuente_id uuid;
  v_permite_multiples boolean;
  v_requiere_entidad boolean;
  v_razon_invalidacion text;
  v_cambio_entidad boolean;
  v_aumento_monto boolean;
  v_monto_recibido_actual numeric;
  v_capital_para_cierre_actual numeric;
  v_total_resultante numeric := 0;
  v_ajustes_aplicados jsonb := '[]'::jsonb;
  v_nuevas_creadas jsonb := '[]'::jsonb;
  v_datos_anteriores jsonb;
BEGIN
  -- ── 0. Extraer parámetros ──────────────────────────────────
  v_negociacion_id := (p_payload->>'negociacion_id')::uuid;
  v_usuario_id     := (p_payload->>'usuario_id')::uuid;
  v_motivo         := p_payload->>'motivo';
  v_notas          := p_payload->>'notas';
  v_valor_vivienda := (p_payload->>'valor_vivienda')::numeric;
  v_cliente_id     := (p_payload->>'cliente_id')::uuid;

  -- Validar inputs obligatorios
  IF v_negociacion_id IS NULL THEN
    RAISE EXCEPTION 'negociacion_id es obligatorio';
  END IF;
  IF v_motivo IS NULL OR v_motivo = '' THEN
    RAISE EXCEPTION 'motivo es obligatorio';
  END IF;

  -- ── 0.1 Snapshot previo para auditoría ─────────────────────
  SELECT jsonb_agg(jsonb_build_object(
    'id', fp.id,
    'tipo', fp.tipo,
    'monto_aprobado', fp.monto_aprobado,
    'entidad', fp.entidad
  ))
  INTO v_datos_anteriores
  FROM fuentes_pago fp
  WHERE fp.negociacion_id = v_negociacion_id
    AND fp.estado_fuente = 'activa';

  -- ── 1. Procesar AJUSTES a fuentes existentes ──────────────
  IF p_payload ? 'ajustes' AND jsonb_array_length(p_payload->'ajustes') > 0 THEN
    FOR v_ajuste IN SELECT * FROM jsonb_array_elements(p_payload->'ajustes')
    LOOP
      v_ajuste_id             := (v_ajuste->>'id')::uuid;
      v_ajuste_tipo           := v_ajuste->>'tipo';
      v_ajuste_monto_original := (v_ajuste->>'montoOriginal')::numeric;
      v_ajuste_monto_nuevo    := (v_ajuste->>'montoEditable')::numeric;
      v_ajuste_entidad_original := v_ajuste->>'entidad';
      v_ajuste_entidad_nueva  := v_ajuste->>'entidadEditable';
      v_ajuste_eliminar       := (v_ajuste->>'paraEliminar')::boolean;

      IF v_ajuste_eliminar THEN
        -- Validar: no permitir inactivar fuente con abonos recibidos
        SELECT COALESCE(fp.monto_recibido, 0) INTO v_monto_recibido_actual
        FROM fuentes_pago fp WHERE fp.id = v_ajuste_id;

        IF v_monto_recibido_actual > 0 THEN
          RAISE EXCEPTION 'No se puede eliminar la fuente "%" porque ya recibió $% en abonos',
            v_ajuste_tipo, v_monto_recibido_actual;
        END IF;

        -- Inactivar fuente
        UPDATE fuentes_pago
        SET estado_fuente = 'inactiva',
            estado = 'Inactiva',
            updated_at = now()
        WHERE id = v_ajuste_id;

        v_ajustes_aplicados := v_ajustes_aplicados || jsonb_build_object(
          'id', v_ajuste_id, 'tipo', v_ajuste_tipo, 'accion', 'eliminada'
        );
      ELSE
        -- Detectar cambios que invalidan documentación
        v_cambio_entidad := v_ajuste_entidad_nueva IS DISTINCT FROM v_ajuste_entidad_original;
        v_aumento_monto  := v_ajuste_monto_nuevo > v_ajuste_monto_original;

        -- Verificar si tipo requiere entidad (desde BD, no hardcodeado)
        SELECT tf.requiere_entidad INTO v_requiere_entidad
        FROM tipos_fuentes_pago tf
        WHERE tf.nombre = v_ajuste_tipo AND tf.activo = true
        LIMIT 1;

        -- 1a. Invalidar documentos si hubo cambio relevante en fuente que requiere docs
        IF COALESCE(v_requiere_entidad, false) AND (v_cambio_entidad OR v_aumento_monto) THEN
          v_razon_invalidacion := CASE
            WHEN v_cambio_entidad AND v_aumento_monto THEN
              format('Invalidado: entidad cambió (%s → %s) y monto aumentó', v_ajuste_entidad_original, v_ajuste_entidad_nueva)
            WHEN v_cambio_entidad THEN
              format('Invalidado: entidad cambió (%s → %s)', v_ajuste_entidad_original, v_ajuste_entidad_nueva)
            ELSE
              format('Invalidado: monto aumentó de $%s a $%s', v_ajuste_monto_original::text, v_ajuste_monto_nuevo::text)
          END;

          UPDATE documentos_cliente
          SET estado = 'archivado',
              razon_obsolescencia = v_razon_invalidacion,
              fecha_obsolescencia = now()
          WHERE fuente_pago_relacionada = v_ajuste_id
            AND estado = 'activo';

          UPDATE fuentes_pago
          SET carta_asignacion_url = NULL
          WHERE id = v_ajuste_id;
        END IF;

        -- 1b. Actualizar monto/entidad si cambiaron
        IF v_ajuste_monto_nuevo IS DISTINCT FROM v_ajuste_monto_original
           OR v_cambio_entidad THEN

          -- Validar: monto no puede ser menor a lo ya recibido
          SELECT COALESCE(fp.monto_recibido, 0) INTO v_monto_recibido_actual
          FROM fuentes_pago fp WHERE fp.id = v_ajuste_id;

          IF v_ajuste_monto_nuevo < v_monto_recibido_actual THEN
            RAISE EXCEPTION 'El monto de "%" ($%) no puede ser menor a lo ya recibido ($%)',
              v_ajuste_tipo, v_ajuste_monto_nuevo, v_monto_recibido_actual;
          END IF;

          UPDATE fuentes_pago
          SET monto_aprobado = v_ajuste_monto_nuevo,
              entidad = CASE WHEN v_cambio_entidad THEN v_ajuste_entidad_nueva ELSE entidad END,
              updated_at = now()
          WHERE id = v_ajuste_id;

          v_ajustes_aplicados := v_ajustes_aplicados || jsonb_build_object(
            'id', v_ajuste_id, 'tipo', v_ajuste_tipo, 'accion', 'actualizada',
            'monto_anterior', v_ajuste_monto_original, 'monto_nuevo', v_ajuste_monto_nuevo
          );
        END IF;

        -- Sumar al total resultante usando capital_para_cierre si existe (créditos)
        SELECT fp.capital_para_cierre INTO v_capital_para_cierre_actual
        FROM fuentes_pago fp WHERE fp.id = v_ajuste_id;

        v_total_resultante := v_total_resultante + COALESCE(v_capital_para_cierre_actual, v_ajuste_monto_nuevo);
      END IF;
    END LOOP;
  END IF;

  -- ── 2. Crear NUEVAS fuentes ────────────────────────────────
  IF p_payload ? 'nuevas' AND jsonb_array_length(p_payload->'nuevas') > 0 THEN
    FOR v_nueva IN SELECT * FROM jsonb_array_elements(p_payload->'nuevas')
    LOOP
      v_nueva_tipo    := v_nueva->>'tipo';
      v_nueva_monto   := (v_nueva->>'monto')::numeric;
      v_nueva_entidad := v_nueva->>'entidad';

      -- Resolver tipo_fuente_id
      SELECT tf.id, tf.permite_multiples_abonos
      INTO v_tipo_fuente_id, v_permite_multiples
      FROM tipos_fuentes_pago tf
      WHERE tf.nombre = v_nueva_tipo AND tf.activo = true
      LIMIT 1;

      IF v_tipo_fuente_id IS NULL THEN
        RAISE EXCEPTION 'Tipo de fuente no encontrado: %', v_nueva_tipo;
      END IF;

      INSERT INTO fuentes_pago (
        negociacion_id, tipo, tipo_fuente_id, monto_aprobado,
        monto_recibido, entidad, permite_multiples_abonos,
        estado, estado_fuente, capital_para_cierre
      ) VALUES (
        v_negociacion_id, v_nueva_tipo, v_tipo_fuente_id, v_nueva_monto,
        0, NULLIF(v_nueva_entidad, ''), COALESCE(v_permite_multiples, false),
        'Activa', 'activa',
        -- Para créditos constructora: capital_para_cierre = monto (sin intereses aún)
        CASE WHEN lower(v_nueva_tipo) LIKE '%cr_dito%constructora%'
              OR lower(v_nueva_tipo) LIKE '%credito%constructora%'
             THEN v_nueva_monto ELSE NULL END
      );

      v_total_resultante := v_total_resultante + v_nueva_monto;

      v_nuevas_creadas := v_nuevas_creadas || jsonb_build_object(
        'tipo', v_nueva_tipo, 'monto', v_nueva_monto, 'entidad', v_nueva_entidad
      );
    END LOOP;
  END IF;

  -- ── 3. Audit log ───────────────────────────────────────────
  INSERT INTO audit_log (
    tabla, accion, registro_id,
    datos_anteriores, datos_nuevos, metadata,
    modulo, usuario_id
  ) VALUES (
    'negociaciones', 'UPDATE', v_negociacion_id,
    jsonb_build_object('fuentes', v_datos_anteriores),
    jsonb_build_object('ajustados', v_ajustes_aplicados, 'nuevas', v_nuevas_creadas),
    jsonb_build_object(
      'motivo', v_motivo,
      'notas', v_notas,
      'valor_vivienda', v_valor_vivienda,
      'accion_tipo', 'rebalanceo_plan_financiero',
      'cliente_id', v_cliente_id
    ),
    'negociaciones',
    v_usuario_id
  );

  -- ── 4. Retornar resultado ──────────────────────────────────
  RETURN jsonb_build_object(
    'success', true,
    'total_resultante', v_total_resultante,
    'ajustes_aplicados', jsonb_array_length(v_ajustes_aplicados),
    'nuevas_creadas', jsonb_array_length(v_nuevas_creadas)
  );

EXCEPTION WHEN OTHERS THEN
  -- La transacción se revierte automáticamente (rollback implícito)
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.rebalancear_plan_financiero(jsonb) TO authenticated;

COMMENT ON FUNCTION public.rebalancear_plan_financiero IS
'Rebalanceo atómico del plan financiero de una negociación. '
'Si cualquier paso falla, toda la operación se revierte.';
