-- ============================================================
-- BACKFILL: Insertar evento audit_log para el descuento $5M
-- de Stefany Pazos Mera (aplicado el 2026-04-11)
--
-- Contexto:
--   El descuento fue aplicado ANTES de que el nuevo trigger
--   negociaciones_audit_trigger_func() fuera desplegado.
--   La mutación de descuento no creaba entrada en audit_log.
--   El descuento SÍ está guardado en negociaciones con las
--   siguientes datos verificados:
--     id:                41c603f2-f095-44ec-9ab3-248afb630b18
--     descuento_aplicado: 5000000
--     tipo_descuento:    comercial
--     motivo_descuento:  Descuento prueba
--     fecha_actualizacion: 2026-04-11T14:59:34
--     cliente_id:        9b56aae7-a46d-41f4-8a15-3200cd233aa4
-- ============================================================

INSERT INTO audit_log (
  tabla,
  accion,
  registro_id,
  usuario_email,
  datos_nuevos,
  cambios_especificos,
  modulo,
  metadata,
  fecha_evento
)
SELECT
  'negociaciones'                                                     AS tabla,
  'UPDATE'                                                            AS accion,
  n.id                                                                AS registro_id,
  'n_rodriguez98@outlook.com'                                         AS usuario_email,
  to_jsonb(n)                                                         AS datos_nuevos,
  jsonb_build_object(
    'descuento_aplicado', jsonb_build_object(
      'anterior', 0,
      'nuevo',    n.descuento_aplicado
    ),
    'tipo_descuento', jsonb_build_object(
      'anterior', null,
      'nuevo',    n.tipo_descuento
    ),
    'motivo_descuento', jsonb_build_object(
      'anterior', null,
      'nuevo',    n.motivo_descuento
    )
  )                                                                   AS cambios_especificos,
  'negociaciones'                                                     AS modulo,
  jsonb_build_object(
    'cliente_id',     n.cliente_id::text,
    'vivienda_id',    n.vivienda_id::text,
    'estado',         n.estado,
    'backfill',       true,
    'backfill_razon', 'Evento creado manualmente. El descuento fue aplicado antes del deploy del trigger negociaciones_audit_trigger_func.'
  )                                                                   AS metadata,
  -- Aproximar a la misma fecha de la última actualización de la negociación
  n.fecha_actualizacion - interval '1 second'                        AS fecha_evento
FROM negociaciones n
WHERE n.id = '41c603f2-f095-44ec-9ab3-248afb630b18'
  AND n.descuento_aplicado > 0
  -- Evitar insertar duplicado si ya existe
  AND NOT EXISTS (
    SELECT 1 FROM audit_log al
    WHERE al.tabla = 'negociaciones'
      AND al.registro_id = '41c603f2-f095-44ec-9ab3-248afb630b18'
      AND al.cambios_especificos ? 'descuento_aplicado'
  );
