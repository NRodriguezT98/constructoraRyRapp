-- =====================================================
-- MIGRACIÓN 034: Agregar tipo_documento cliente a vistas de renuncias
-- =====================================================
-- Agrega c.tipo_documento AS cliente_tipo_documento a:
--   v_renuncias_completas (usada por el módulo)
--   v_renuncias_pendientes (usada por dashboard)
-- =====================================================

-- Vista completa (tipo_documento añadido al final para preservar orden de columnas)
CREATE OR REPLACE VIEW v_renuncias_completas AS
SELECT
  r.*,
  c.nombre_completo AS cliente_nombre,
  c.numero_documento AS cliente_documento,
  c.telefono        AS cliente_telefono,
  v.numero          AS vivienda_numero,
  m.nombre          AS manzana_nombre,
  p.id              AS proyecto_id,
  p.nombre          AS proyecto_nombre,
  n.valor_total     AS negociacion_valor_total,
  EXTRACT(DAY FROM (NOW() - r.fecha_renuncia))::INTEGER AS dias_desde_renuncia,
  c.tipo_documento  AS cliente_tipo_documento
FROM renuncias r
INNER JOIN negociaciones n ON n.id = r.negociacion_id
INNER JOIN clientes c ON c.id = r.cliente_id
INNER JOIN viviendas v ON v.id = r.vivienda_id
INNER JOIN manzanas m ON m.id = v.manzana_id
INNER JOIN proyectos p ON p.id = m.proyecto_id
ORDER BY r.fecha_renuncia DESC;

-- Vista pendientes (tipo_documento añadido al final para preservar orden de columnas)
CREATE OR REPLACE VIEW v_renuncias_pendientes AS
SELECT
  r.id,
  r.fecha_renuncia,
  r.motivo,
  r.monto_a_devolver,
  r.retencion_monto,
  r.retencion_motivo,
  r.requiere_devolucion,
  c.id               AS cliente_id,
  c.nombre_completo  AS cliente_nombre,
  c.numero_documento AS cliente_documento,
  c.telefono         AS cliente_telefono,
  v.numero           AS vivienda_numero,
  p.nombre           AS proyecto_nombre,
  n.valor_total      AS negociacion_valor_total,
  EXTRACT(DAY FROM (NOW() - r.fecha_renuncia))::INTEGER AS dias_pendiente,
  c.tipo_documento   AS cliente_tipo_documento
FROM renuncias r
INNER JOIN negociaciones n ON n.id = r.negociacion_id
INNER JOIN clientes c ON c.id = r.cliente_id
INNER JOIN viviendas v ON v.id = r.vivienda_id
INNER JOIN manzanas m ON m.id = v.manzana_id
INNER JOIN proyectos p ON p.id = m.proyecto_id
WHERE r.estado = 'Pendiente Devolución'
ORDER BY r.fecha_renuncia ASC;
