-- ============================================================
-- Migración 027: Copiar plan de crédito a negociaciones
--               creadas por traslado sin cuotas (fix retroactivo)
--
-- Problema: El traslado de vivienda NO copiaba creditos_constructora
-- ni cuotas_credito a las nuevas fuentes_pago.
-- Esta migración copia los datos desde la fuente de origen (inactiva)
-- a la fuente destino (activa) para todos los casos ya ocurridos.
-- ============================================================

DO $$
DECLARE
  v_fuente_destino RECORD;
  v_fuente_origen  RECORD;
  v_credito        RECORD;
  v_cuota          RECORD;
  v_count          INT := 0;
BEGIN

  -- Buscar fuentes activas de tipo "Crédito con la Constructora"
  -- que no tienen entrada en creditos_constructora
  -- Y cuya negociación tiene negociacion_origen_id (fue un traslado)
  FOR v_fuente_destino IN
    SELECT fp.id            AS fuente_destino_id,
           fp.negociacion_id,
           fp.tipo,
           n.negociacion_origen_id
    FROM   fuentes_pago fp
    JOIN   negociaciones n ON n.id = fp.negociacion_id
    WHERE  fp.tipo ILIKE 'crédito con la constructora'
    AND    fp.estado = 'Activa'
    AND    n.negociacion_origen_id IS NOT NULL
    AND    NOT EXISTS (
             SELECT 1 FROM creditos_constructora cc
             WHERE cc.fuente_pago_id = fp.id
           )
  LOOP

    -- Encontrar la fuente de origen (misma negociación origen, mismo tipo, Inactiva)
    SELECT fp.id INTO v_fuente_origen
    FROM   fuentes_pago fp
    WHERE  fp.negociacion_id = v_fuente_destino.negociacion_origen_id
    AND    fp.tipo ILIKE 'crédito con la constructora'
    AND    fp.estado = 'Inactiva'
    LIMIT  1;

    IF v_fuente_origen.id IS NULL THEN
      RAISE WARNING 'No se encontró fuente origen para negociacion_origen_id=%',
                    v_fuente_destino.negociacion_origen_id;
      CONTINUE;
    END IF;

    -- Leer el crédito origen
    SELECT * INTO v_credito
    FROM   creditos_constructora
    WHERE  fuente_pago_id = v_fuente_origen.id
    LIMIT  1;

    IF v_credito IS NULL THEN
      RAISE WARNING 'No hay credito_constructora para fuente origen id=%', v_fuente_origen.id;
      CONTINUE;
    END IF;

    -- Insertar copia en fuente destino
    INSERT INTO creditos_constructora (
      fuente_pago_id,
      capital,
      tasa_mensual,
      num_cuotas,
      fecha_inicio,
      valor_cuota,
      interes_total,
      monto_total,
      tasa_mora_diaria,
      version_actual
    ) VALUES (
      v_fuente_destino.fuente_destino_id,
      v_credito.capital,
      v_credito.tasa_mensual,
      v_credito.num_cuotas,
      v_credito.fecha_inicio,
      v_credito.valor_cuota,
      v_credito.interes_total,
      v_credito.monto_total,
      v_credito.tasa_mora_diaria,
      v_credito.version_actual
    );

    -- Copiar cuotas del plan vigente
    FOR v_cuota IN
      SELECT numero_cuota, fecha_vencimiento, valor_cuota, version_plan, notas
      FROM   cuotas_credito
      WHERE  fuente_pago_id = v_fuente_origen.id
      AND    version_plan   = v_credito.version_actual
      ORDER  BY numero_cuota
    LOOP
      INSERT INTO cuotas_credito (
        fuente_pago_id,
        numero_cuota,
        fecha_vencimiento,
        valor_cuota,
        version_plan,
        notas
      ) VALUES (
        v_fuente_destino.fuente_destino_id,
        v_cuota.numero_cuota,
        v_cuota.fecha_vencimiento,
        v_cuota.valor_cuota,
        v_cuota.version_plan,
        v_cuota.notas
      );
    END LOOP;

    v_count := v_count + 1;
    RAISE NOTICE 'Crédito copiado: fuente origen=% → fuente destino=%',
                 v_fuente_origen.id, v_fuente_destino.fuente_destino_id;
  END LOOP;

  RAISE NOTICE 'Fix completado. Negociaciones por traslado arregladas: %', v_count;
END $$;
