-- Backfill del evento ANULAR para el abono ffbc5532-afa1-4b71-804b-b4996c6221e9
-- (Recibo #3, $2.000.000, Jorge Andres Cadena Diuzaa, anulado el 2026-04-09)

INSERT INTO audit_log (
  accion,
  tabla,
  registro_id,
  usuario_email,
  usuario_id,
  usuario_nombres,
  usuario_rol,
  datos_anteriores,
  datos_nuevos,
  metadata,
  modulo,
  fecha_evento
)
SELECT
  'ANULAR'                    AS accion,
  'abonos_historial'          AS tabla,
  ah.id                       AS registro_id,
  COALESCE(ah.anulado_por_id::text, 'sistema@backfill')  AS usuario_email,
  ah.anulado_por_id           AS usuario_id,
  ah.anulado_por_nombre       AS usuario_nombres,
  'Administrador'             AS usuario_rol,

  -- Snapshot del estado anterior
  jsonb_build_object(
    'estado',            'Activo',
    'monto',             ah.monto,
    'numero_recibo',     ah.numero_recibo,
    'metodo_pago',       ah.metodo_pago,
    'fecha_abono',       ah.fecha_abono,
    'numero_referencia', ah.numero_referencia,
    'negociacion_id',    ah.negociacion_id,
    'fuente_pago_id',    ah.fuente_pago_id
  )                           AS datos_anteriores,

  -- Snapshot del estado posterior
  jsonb_build_object(
    'estado',            'Anulado',
    'motivo_categoria',  ah.motivo_categoria,
    'motivo_detalle',    ah.motivo_detalle,
    'anulado_por_nombre',ah.anulado_por_nombre,
    'fecha_anulacion',   ah.fecha_anulacion
  )                           AS datos_nuevos,

  -- Metadata enriquecida (idéntica a lo que ensambla el route de anular)
  jsonb_build_object(
    -- Clave crítica para filtro de historial del cliente
    'cliente_id',                    n.cliente_id,
    'cliente_nombre',                cl.nombres || ' ' || cl.apellidos,

    -- Datos del abono original
    'abono_monto',                   ah.monto,
    'abono_numero_recibo',           ah.numero_recibo,
    'abono_metodo_pago',             ah.metodo_pago,
    'abono_fecha_abono',             ah.fecha_abono,
    'abono_numero_referencia',       ah.numero_referencia,
    'abono_notas',                   ah.notas,
    'abono_mora_incluida',           ah.mora_incluida,
    'abono_comprobante_url',         ah.comprobante_url,

    -- Fuente de pago
    'fuente_tipo',                   fp.tipo,
    'fuente_monto_aprobado',         fp.monto_aprobado,

    -- Negociación
    'negociacion_id',                n.id,
    'negociacion_valor_total_pagar', n.valor_total_pagar,

    -- Vivienda / Proyecto
    'vivienda_numero',               v.numero,
    'manzana_nombre',                mz.nombre,
    'proyecto_nombre',               pr.nombre,

    -- Datos de la anulación
    'motivo_categoria',              ah.motivo_categoria,
    'motivo_detalle',                ah.motivo_detalle,
    'anulado_por_nombre',            ah.anulado_por_nombre,
    'fecha_anulacion',               ah.fecha_anulacion,

    'backfill',                      true
  )                           AS metadata,

  'abonos'                    AS modulo,
  ah.fecha_anulacion          AS fecha_evento

FROM abonos_historial ah
INNER JOIN fuentes_pago  fp  ON fp.id  = ah.fuente_pago_id
INNER JOIN negociaciones n   ON n.id   = ah.negociacion_id
INNER JOIN clientes      cl  ON cl.id  = n.cliente_id
INNER JOIN viviendas     v   ON v.id   = n.vivienda_id
INNER JOIN manzanas      mz  ON mz.id  = v.manzana_id
INNER JOIN proyectos     pr  ON pr.id  = mz.proyecto_id

WHERE ah.id = 'ffbc5532-afa1-4b71-804b-b4996c6221e9'
  AND ah.estado = 'Anulado'
  -- Evitar duplicados
  AND NOT EXISTS (
    SELECT 1 FROM audit_log al
    WHERE al.tabla   = 'abonos_historial'
      AND al.registro_id = ah.id
      AND al.accion  = 'ANULAR'
  );

-- Verificar resultado
SELECT
  al.accion,
  al.fecha_evento,
  al.metadata->>'cliente_nombre'      AS cliente,
  al.metadata->>'abono_monto'         AS monto,
  al.metadata->>'abono_numero_recibo' AS recibo,
  al.metadata->>'motivo_categoria'    AS motivo,
  al.metadata->>'anulado_por_nombre'  AS anulado_por,
  al.metadata->>'proyecto_nombre'     AS proyecto,
  al.metadata->>'vivienda_numero'     AS vivienda
FROM audit_log al
WHERE al.tabla = 'abonos_historial'
  AND al.registro_id = 'ffbc5532-afa1-4b71-804b-b4996c6221e9'
ORDER BY al.fecha_evento;
