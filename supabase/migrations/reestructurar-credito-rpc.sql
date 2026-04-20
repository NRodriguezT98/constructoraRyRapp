-- ============================================================
-- RPC: reestructurar_credito
--
-- Reestructuración ATÓMICA de un crédito con la constructora:
--   1. Elimina cuotas del plan anterior (version_plan < nueva_version)
--   2. Actualiza creditos_constructora con los nuevos términos
--   3. Actualiza fuentes_pago.monto_aprobado (NO toca capital_para_cierre)
--   4. Inserta el nuevo calendario de cuotas
--   5. Registra en audit_log con snapshot antes/después y motivo
--
-- DECISIÓN DE DISEÑO:
--   capital_para_cierre NO se modifica al reestructurar.
--   Representa el monto comprometido de la vivienda (balance del cierre).
--   Cambiarlo rompería sum(fuentes) = valor_total_pagar y bloquearía abonos.
--   Solo monto_aprobado cambia (= capitalPendiente + nuevos intereses).
--
-- Ejecutar con:
--   npm run db:exec supabase/migrations/reestructurar-credito-rpc.sql
-- ============================================================

CREATE OR REPLACE FUNCTION public.reestructurar_credito(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fuente_pago_id      uuid;
  v_credito_id          uuid;
  v_usuario_id          uuid;
  v_capital_pendiente   numeric;
  v_nueva_tasa          numeric;
  v_nuevas_num_cuotas   int;
  v_nuevo_monto_total   numeric;
  v_nuevo_valor_cuota   numeric;
  v_nuevo_interes_total numeric;
  v_nueva_version       int;
  v_motivo              text;
  v_notas               text;
  v_datos_anteriores    jsonb;
  v_cuota               jsonb;
  v_monto_recibido      numeric;
BEGIN
  -- ── Extraer parámetros ─────────────────────────────────────────────
  v_fuente_pago_id      := (p_payload->>'fuente_pago_id')::uuid;
  v_credito_id          := (p_payload->>'credito_id')::uuid;
  v_usuario_id          := (p_payload->>'usuario_id')::uuid;
  v_capital_pendiente   := (p_payload->>'capital_pendiente')::numeric;
  v_nueva_tasa          := (p_payload->>'nueva_tasa_mensual')::numeric;
  v_nuevas_num_cuotas   := (p_payload->>'nuevas_num_cuotas')::int;
  v_nuevo_monto_total   := (p_payload->>'nuevo_monto_total')::numeric;
  v_nuevo_valor_cuota   := (p_payload->>'nuevo_valor_cuota')::numeric;
  v_nuevo_interes_total := (p_payload->>'nuevo_interes_total')::numeric;
  v_nueva_version       := (p_payload->>'nueva_version')::int;
  v_motivo              := COALESCE(NULLIF(trim(p_payload->>'motivo'), ''), 'Reestructuración de crédito');
  v_notas               := NULLIF(trim(p_payload->>'notas'), '');

  -- ── Validaciones ───────────────────────────────────────────────────
  IF v_fuente_pago_id IS NULL THEN
    RAISE EXCEPTION 'fuente_pago_id es obligatorio';
  END IF;
  IF v_credito_id IS NULL THEN
    RAISE EXCEPTION 'credito_id es obligatorio';
  END IF;
  IF v_capital_pendiente IS NULL OR v_capital_pendiente <= 0 THEN
    RAISE EXCEPTION 'capital_pendiente debe ser mayor a cero';
  END IF;
  IF v_nuevo_monto_total IS NULL OR v_nuevo_monto_total <= 0 THEN
    RAISE EXCEPTION 'nuevo_monto_total debe ser mayor a cero';
  END IF;
  IF v_nueva_version IS NULL OR v_nueva_version < 2 THEN
    RAISE EXCEPTION 'nueva_version debe ser mayor a 1';
  END IF;

  -- Validar que el nuevo monto no sea menor a lo ya cobrado
  SELECT COALESCE(fp.monto_recibido, 0)
  INTO v_monto_recibido
  FROM fuentes_pago fp
  WHERE fp.id = v_fuente_pago_id;

  IF v_nuevo_monto_total < v_monto_recibido THEN
    RAISE EXCEPTION
      'El nuevo monto total (%) no puede ser menor a lo ya recibido (%)',
      v_nuevo_monto_total, v_monto_recibido;
  END IF;

  -- ── Snapshot previo para auditoría ────────────────────────────────
  SELECT jsonb_build_object(
    'credito_id',          cc.id,
    'capital',             cc.capital,
    'tasa_mensual',        cc.tasa_mensual,
    'num_cuotas',          cc.num_cuotas,
    'valor_cuota',         cc.valor_cuota,
    'interes_total',       cc.interes_total,
    'monto_total',         cc.monto_total,
    'version_actual',      cc.version_actual,
    'monto_aprobado',      fp.monto_aprobado,
    'capital_para_cierre', fp.capital_para_cierre
  )
  INTO v_datos_anteriores
  FROM creditos_constructora cc
  JOIN fuentes_pago fp ON fp.id = cc.fuente_pago_id
  WHERE cc.id = v_credito_id;

  -- ── Paso 1: Eliminar cuotas del plan anterior ───────────────────────
  DELETE FROM cuotas_credito
  WHERE fuente_pago_id = v_fuente_pago_id
    AND version_plan < v_nueva_version;

  -- ── Paso 2: Actualizar creditos_constructora con nuevos términos ───
  UPDATE creditos_constructora
  SET
    capital        = v_capital_pendiente,
    tasa_mensual   = v_nueva_tasa,
    num_cuotas     = v_nuevas_num_cuotas,
    valor_cuota    = v_nuevo_valor_cuota,
    interes_total  = v_nuevo_interes_total,
    monto_total    = v_nuevo_monto_total,
    version_actual = v_nueva_version,
    updated_at     = now()
  WHERE id = v_credito_id;

  -- ── Paso 3: Actualizar fuentes_pago (solo monto_aprobado) ──────────
  --    capital_para_cierre permanece intacto para preservar balance
  UPDATE fuentes_pago
  SET
    monto_aprobado = v_nuevo_monto_total,
    updated_at     = now()
  WHERE id = v_fuente_pago_id;

  -- ── Paso 4: Insertar nuevo calendario de cuotas ────────────────────
  FOR v_cuota IN SELECT * FROM jsonb_array_elements(p_payload->'cuotas')
  LOOP
    INSERT INTO cuotas_credito (
      fuente_pago_id,
      numero_cuota,
      fecha_vencimiento,
      valor_cuota,
      version_plan
    ) VALUES (
      v_fuente_pago_id,
      (v_cuota->>'numero_cuota')::int,
      (v_cuota->>'fecha_vencimiento')::date,
      (v_cuota->>'valor_cuota')::numeric,
      v_nueva_version
    );
  END LOOP;

  -- ── Paso 5: Audit log ──────────────────────────────────────────────
  INSERT INTO audit_log (
    tabla,
    accion,
    registro_id,
    datos_anteriores,
    datos_nuevos,
    metadata,
    modulo,
    usuario_id
  ) VALUES (
    'creditos_constructora',
    'UPDATE',
    v_credito_id,
    v_datos_anteriores,
    jsonb_build_object(
      'capital_pendiente',    v_capital_pendiente,
      'nuevo_monto_total',    v_nuevo_monto_total,
      'nueva_version',        v_nueva_version,
      'nueva_tasa_mensual',   v_nueva_tasa,
      'nuevas_num_cuotas',    v_nuevas_num_cuotas,
      'fuente_pago_id',       v_fuente_pago_id
    ),
    jsonb_build_object(
      'motivo',               v_motivo,
      'notas',                v_notas,
      'accion_tipo',          'reestructuracion_credito'
    ),
    'clientes',
    v_usuario_id
  );

  RETURN jsonb_build_object('success', true, 'nueva_version', v_nueva_version);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.reestructurar_credito(jsonb) TO authenticated;

COMMENT ON FUNCTION public.reestructurar_credito IS
  'Reestructuración atómica de crédito con la constructora. '
  'Actualiza creditos_constructora, reemplaza cuotas y registra audit_log. '
  'NO modifica capital_para_cierre para preservar el balance del cierre financiero.';
