-- Recrear vista fuentes_pago_con_entidad después de DROP CASCADE en carta_aprobacion_url
-- La vista usa fp.* y el CASCADE eliminó la vista junto con la columna

CREATE OR REPLACE VIEW fuentes_pago_con_entidad AS
SELECT
  fp.id,
  fp.negociacion_id,
  fp.tipo,
  fp.tipo_fuente_id,
  fp.entidad,
  fp.entidad_financiera_id,
  fp.monto_aprobado,
  fp.monto_recibido,
  fp.saldo_pendiente,
  fp.porcentaje_completado,
  fp.numero_referencia,
  fp.permite_multiples_abonos,
  fp.carta_asignacion_url,
  fp.estado,
  fp.estado_fuente,
  fp.estado_documentacion,
  fp.fecha_completado,
  fp.fecha_inactivacion,
  fp.fecha_resolucion,
  fp.fecha_acta,
  fp.razon_inactivacion,
  fp.reemplazada_por,
  fp.version_negociacion,
  fp.fecha_creacion,
  fp.fecha_actualizacion,
  ef.nombre AS entidad_nombre,
  ef.tipo AS entidad_tipo,
  ef.codigo AS entidad_codigo,
  COALESCE(ef.nombre, fp.entidad) AS entidad_display
FROM fuentes_pago fp
LEFT JOIN entidades_financieras ef ON fp.entidad_financiera_id = ef.id;

COMMENT ON VIEW fuentes_pago_con_entidad IS 'Vista con JOIN a entidades_financieras. Usar para queries que necesitan datos de entidad';
