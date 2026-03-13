-- =====================================================
-- MIGRACIÓN: Agregar número de recibo serial global
-- Fecha: 2026-03-12
-- =====================================================

-- 0. VERIFICAR que no hay datos (si retorna > 0, NO ejecutar el TRUNCATE)
-- SELECT COUNT(*) FROM abonos_historial;

-- 1. Limpiar abonos existentes (confirmado: no hay datos en producción)
TRUNCATE TABLE abonos_historial RESTART IDENTITY CASCADE;

-- 2. Crear secuencia global para número de recibo
CREATE SEQUENCE IF NOT EXISTS seq_numero_recibo_global
  START 1
  INCREMENT 1
  NO MAXVALUE
  NO CYCLE;

-- 3. Agregar columna numero_recibo con default de la secuencia
ALTER TABLE abonos_historial
  ADD COLUMN IF NOT EXISTS numero_recibo INTEGER
    DEFAULT nextval('seq_numero_recibo_global')
    NOT NULL;

-- 4. Índice único para garantizar unicidad
CREATE UNIQUE INDEX IF NOT EXISTS idx_abonos_historial_numero_recibo
  ON abonos_historial (numero_recibo);

-- 5. Comentario descriptivo
COMMENT ON COLUMN abonos_historial.numero_recibo IS
  'Consecutivo global único de recibo. Formato de presentación: RYR-0001. Auto-asignado por secuencia.';

-- =====================================================
-- ACTUALIZAR VISTA vista_abonos_completos para incluir numero_recibo
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
  ah.notas,
  ah.fecha_creacion,
  ah.fecha_actualizacion,
  ah.usuario_registro,

  -- Cliente
  n.cliente_id,
  c.nombres    AS cliente_nombres,
  c.apellidos  AS cliente_apellidos,
  c.numero_documento AS cliente_numero_documento,

  -- Negociación
  n.estado     AS negociacion_estado,

  -- Fuente de pago
  fp.tipo      AS fuente_pago_tipo,

  -- Vivienda
  v.id         AS vivienda_id,
  v.numero     AS vivienda_numero,
  m.id         AS manzana_id,
  m.nombre     AS manzana_nombre,

  -- Proyecto
  p.id         AS proyecto_id,
  p.nombre     AS proyecto_nombre

FROM abonos_historial ah
JOIN negociaciones n  ON ah.negociacion_id = n.id
JOIN clientes c       ON n.cliente_id = c.id
JOIN fuentes_pago fp  ON ah.fuente_pago_id = fp.id
LEFT JOIN viviendas v ON n.vivienda_id = v.id
LEFT JOIN manzanas m  ON v.manzana_id = m.id
LEFT JOIN proyectos p ON m.proyecto_id = p.id
ORDER BY ah.numero_recibo DESC;
