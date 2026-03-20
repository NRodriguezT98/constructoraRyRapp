-- Agregar capital_para_cierre a la vista fuentes_pago_con_entidad
-- La columna existe en fuentes_pago desde 2026-03-17 pero la vista
-- fue creada/recreada el 2026-03-14 (antes de agregar la columna).
-- CREATE OR REPLACE no puede insertar columnas en el medio → DROP + CREATE.

DROP VIEW IF EXISTS fuentes_pago_con_entidad;

CREATE VIEW fuentes_pago_con_entidad AS
SELECT
  fp.id,
  fp.negociacion_id,
  fp.tipo,
  fp.tipo_fuente_id,
  fp.entidad,
  fp.entidad_financiera_id,
  fp.monto_aprobado,
  fp.capital_para_cierre,
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

COMMENT ON VIEW fuentes_pago_con_entidad IS 'Vista con JOIN a entidades_financieras. Incluye capital_para_cierre para cálculo correcto de cierre financiero.';
