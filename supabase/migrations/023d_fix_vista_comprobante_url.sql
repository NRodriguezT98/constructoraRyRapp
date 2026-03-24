-- ================================================================
-- 023d: Fix vista_abonos_completos - Agregar comprobante_url faltante
-- ================================================================
-- La vista original omitió ah.comprobante_url, causando que los
-- comprobantes no se muestren en el modal de detalle.
-- ================================================================

DROP VIEW IF EXISTS vista_abonos_completos;

CREATE VIEW vista_abonos_completos AS
SELECT
  -- Campos del abono
  ah.id,
  ah.numero_recibo,
  ah.monto,
  ah.fecha_abono,
  ah.metodo_pago,
  ah.numero_referencia,
  ah.comprobante_url,
  ah.notas,
  ah.usuario_registro,
  ah.fecha_creacion,
  ah.fecha_actualizacion,
  -- Campos de anulación
  ah.estado,
  ah.motivo_categoria,
  ah.motivo_detalle,
  ah.anulado_por_id,
  ah.anulado_por_nombre,
  ah.fecha_anulacion,
  -- Negociación
  ah.negociacion_id,
  n.estado                     AS negociacion_estado,
  -- Fuente de pago
  ah.fuente_pago_id,
  fp.tipo                      AS fuente_pago_tipo,
  -- Cliente
  c.id                         AS cliente_id,
  c.nombres                    AS cliente_nombres,
  c.apellidos                  AS cliente_apellidos,
  c.numero_documento           AS cliente_numero_documento,
  -- Vivienda
  v.id                         AS vivienda_id,
  v.numero                     AS vivienda_numero,
  -- Manzana
  m.id                         AS manzana_id,
  m.nombre                     AS manzana_nombre,
  -- Proyecto
  p.id                         AS proyecto_id,
  p.nombre                     AS proyecto_nombre
FROM abonos_historial ah
JOIN fuentes_pago      fp ON fp.id             = ah.fuente_pago_id
JOIN negociaciones     n  ON n.id              = fp.negociacion_id
JOIN clientes          c  ON c.id              = n.cliente_id
JOIN viviendas         v  ON v.id              = n.vivienda_id
JOIN manzanas          m  ON m.id              = v.manzana_id
JOIN proyectos         p  ON p.id              = m.proyecto_id;
