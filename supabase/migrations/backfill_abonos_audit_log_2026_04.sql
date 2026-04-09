-- ============================================================
-- BACKFILL: Registrar en audit_log los abonos anteriores a la
-- implementación del registro automático (2026-04-09).
--
-- Inserta un evento audit_log por cada abono en abonos_historial
-- que NO tenga ya un registro en audit_log (evita duplicados).
--
-- El campo metadata.cliente_id es CRÍTICO para que el historial
-- del cliente los muestre correctamente.
-- ============================================================

INSERT INTO audit_log (
  accion,
  tabla,
  registro_id,
  usuario_email,
  usuario_nombres,
  usuario_rol,
  datos_nuevos,
  metadata,
  modulo,
  fecha_evento
)
SELECT
  'CREATE'                          AS accion,
  'abonos_historial'                AS tabla,
  ah.id                             AS registro_id,

  -- Usuario: usar el campo usuario_registro del abono si existe, si no 'sistema'
  COALESCE(ah.usuario_registro::text, 'sistema@backfill') AS usuario_email,
  NULL                              AS usuario_nombres,
  NULL                              AS usuario_rol,

  -- datos_nuevos: snapshot del abono
  to_jsonb(ah)                      AS datos_nuevos,

  -- metadata enriquecida con toda la jerarquía
  jsonb_build_object(
    -- Clave crítica para filtro de historial del cliente
    'cliente_id',                   n.cliente_id,
    'cliente_nombre',               cl.nombres || ' ' || cl.apellidos,

    -- Datos del abono
    'abono_monto',                  ah.monto,
    'abono_numero_recibo',          ah.numero_recibo,
    'abono_metodo_pago',            ah.metodo_pago,
    'abono_fecha_abono',            ah.fecha_abono,
    'abono_numero_referencia',      ah.numero_referencia,
    'abono_notas',                  ah.notas,
    'abono_mora_incluida',          ah.mora_incluida,
    'abono_comprobante_url',        ah.comprobante_url,

    -- Fuente de pago
    'fuente_tipo',                  fp.tipo,
    'fuente_monto_aprobado',        fp.monto_aprobado,
    -- Para abonos históricos no tenemos el saldo "antes", usamos el monto_recibido actual
    'fuente_monto_despues',         fp.monto_recibido,
    'fuente_saldo_despues',         fp.saldo_pendiente,

    -- Negociación
    'negociacion_id',               n.id,
    'negociacion_valor_total_pagar', n.valor_total_pagar,
    'negociacion_saldo_despues',    n.saldo_pendiente,

    -- Vivienda / Manzana / Proyecto
    'vivienda_numero',              v.numero,
    'manzana_nombre',               mz.nombre,
    'proyecto_nombre',              pr.nombre,

    -- Indicador de que fue generado por backfill
    'backfill',                     true
  )                                 AS metadata,

  'abonos'                          AS modulo,

  -- Usar fecha_creacion del abono como fecha del evento
  ah.fecha_creacion                 AS fecha_evento

FROM abonos_historial ah

-- Joins para obtener el contexto completo
INNER JOIN fuentes_pago    fp  ON fp.id  = ah.fuente_pago_id
INNER JOIN negociaciones   n   ON n.id   = ah.negociacion_id
INNER JOIN clientes        cl  ON cl.id  = n.cliente_id
INNER JOIN viviendas       v   ON v.id   = n.vivienda_id
INNER JOIN manzanas        mz  ON mz.id  = v.manzana_id
INNER JOIN proyectos       pr  ON pr.id  = mz.proyecto_id

-- Solo abonos activos (no anulados)
WHERE ah.estado = 'Activo'

-- Evitar duplicados: solo insertar si NO hay ya un audit_log para este abono
AND NOT EXISTS (
  SELECT 1
  FROM audit_log al
  WHERE al.tabla = 'abonos_historial'
    AND al.registro_id = ah.id
    AND al.accion = 'CREATE'
)

ORDER BY ah.fecha_creacion ASC;

-- Verificar cuántos registros se insertaron
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM audit_log
  WHERE tabla = 'abonos_historial'
    AND accion = 'CREATE'
    AND metadata->>'backfill' = 'true';

  RAISE NOTICE 'Total de abonos históricos registrados en audit_log: %', v_count;
END;
$$;
