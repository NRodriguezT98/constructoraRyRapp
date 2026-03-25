-- =====================================================
-- MIGRACIÓN 036: Backfill usuario_registro / usuario_cierre
-- =====================================================
-- Problema: renuncias guardadas antes del fix 035 tenían
--   usuario_registro = auth.uid() (UUID) en lugar del email.
-- Solución: reemplazar UUID por email consultando auth.users
-- =====================================================

-- =====================================================
-- MIGRACIÓN 036: Cambiar usuario_registro/cierre a TEXT + backfill email
-- =====================================================
-- Las columnas son tipo UUID → no pueden almacenar email.
-- Las vistas usan r.* → hay que drop+recreate.
-- =====================================================

-- Paso 1: Drop vistas que dependen de las columnas
DROP VIEW IF EXISTS v_renuncias_completas;
DROP VIEW IF EXISTS v_renuncias_pendientes;

-- Paso 2: Drop FK constraints que apuntan a auth.users
ALTER TABLE renuncias
  DROP CONSTRAINT IF EXISTS renuncias_usuario_registro_fkey,
  DROP CONSTRAINT IF EXISTS renuncias_usuario_cierre_fkey;

-- Paso 3: Cambiar tipo de columnas de UUID a TEXT
ALTER TABLE renuncias
  ALTER COLUMN usuario_registro TYPE TEXT USING usuario_registro::text,
  ALTER COLUMN usuario_cierre   TYPE TEXT USING usuario_cierre::text;

-- Paso 3: Backfill UUID → email
UPDATE renuncias r
SET usuario_registro = u.email
FROM auth.users u
WHERE r.usuario_registro ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND u.id::text = r.usuario_registro;

UPDATE renuncias r
SET usuario_cierre = u.email
FROM auth.users u
WHERE r.usuario_cierre IS NOT NULL
  AND r.usuario_cierre ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND u.id::text = r.usuario_cierre;

-- Paso 4: Recrear vistas (idénticas a migración 035)
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
  c.tipo_documento  AS cliente_tipo_documento,
  n.valor_total_pagar AS negociacion_valor_total_pagar
FROM renuncias r
INNER JOIN negociaciones n ON n.id = r.negociacion_id
INNER JOIN clientes c ON c.id = r.cliente_id
INNER JOIN viviendas v ON v.id = r.vivienda_id
INNER JOIN manzanas m ON m.id = v.manzana_id
INNER JOIN proyectos p ON p.id = m.proyecto_id
ORDER BY r.fecha_renuncia DESC;

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
  c.tipo_documento   AS cliente_tipo_documento,
  n.valor_total_pagar AS negociacion_valor_total_pagar
FROM renuncias r
INNER JOIN negociaciones n ON n.id = r.negociacion_id
INNER JOIN clientes c ON c.id = r.cliente_id
INNER JOIN viviendas v ON v.id = r.vivienda_id
INNER JOIN manzanas m ON m.id = v.manzana_id
INNER JOIN proyectos p ON p.id = m.proyecto_id
WHERE r.estado = 'Pendiente Devolución'
ORDER BY r.fecha_renuncia ASC;
