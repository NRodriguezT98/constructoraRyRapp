-- =====================================================
-- MIGRACIÓN: Agregar datos financieros de la negociación
--            a vista_abonos_completos
-- Fecha: 2026-04-16
-- Motivo: El recibo PDF en la lista global de abonos
--         no mostraba "Resumen Financiero" porque la vista
--         no incluía valor_total/total_abonado/saldo_pendiente
--         de la negociación.
-- =====================================================

DROP VIEW IF EXISTS vista_abonos_completos;

CREATE VIEW vista_abonos_completos AS
SELECT
  ah.id,
  ah.numero_recibo,
  ah.negociacion_id,
  ah.fuente_pago_id,
  ah.monto,
  ah.fecha_abono,
  ah.metodo_pago,
  ah.numero_referencia,
  ah.comprobante_url,
  ah.notas,
  ah.fecha_creacion,
  ah.fecha_actualizacion,
  ah.usuario_registro,
  ah.estado,
  ah.motivo_categoria,
  ah.motivo_detalle,
  ah.anulado_por_id,
  ah.anulado_por_nombre,
  ah.fecha_anulacion,

  -- Cliente
  n.cliente_id,
  c.nombres                  AS cliente_nombres,
  c.apellidos                AS cliente_apellidos,
  c.numero_documento         AS cliente_numero_documento,

  -- Negociación
  n.estado                   AS negociacion_estado,

  -- Financieros de la negociación (para el recibo PDF)
  COALESCE(n.valor_total_pagar, n.valor_total, 0) AS negociacion_valor_total,
  COALESCE(n.total_abonado, 0)                    AS negociacion_total_abonado,
  COALESCE(n.saldo_pendiente, 0)                  AS negociacion_saldo_pendiente,

  -- Fuente de pago
  fp.tipo                    AS fuente_pago_tipo,

  -- Vivienda
  v.id                       AS vivienda_id,
  v.numero                   AS vivienda_numero,
  m.id                       AS manzana_id,
  m.nombre                   AS manzana_nombre,

  -- Proyecto
  p.id                       AS proyecto_id,
  p.nombre                   AS proyecto_nombre

FROM abonos_historial ah
JOIN negociaciones   n  ON ah.negociacion_id = n.id
JOIN clientes        c  ON n.cliente_id      = c.id
JOIN fuentes_pago   fp  ON ah.fuente_pago_id = fp.id
LEFT JOIN viviendas  v  ON n.vivienda_id     = v.id
LEFT JOIN manzanas   m  ON v.manzana_id      = m.id
LEFT JOIN proyectos  p  ON m.proyecto_id     = p.id
ORDER BY ah.numero_recibo DESC;

-- Permisos
ALTER VIEW vista_abonos_completos OWNER TO postgres;
GRANT SELECT ON vista_abonos_completos TO authenticated;
GRANT SELECT ON vista_abonos_completos TO anon;

COMMENT ON VIEW vista_abonos_completos IS
  'Vista optimizada de abonos con todos los JOINs. Incluye financieros de la negociación para el recibo PDF.';
