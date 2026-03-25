-- =====================================================
-- MIGRACIÓN 041: Agregar campo consecutivo a renuncias
-- Formato: REN-YYYY-NNN (ej: REN-2026-001)
-- =====================================================

-- 1. Agregar columna (nullable primero para backfill)
ALTER TABLE renuncias ADD COLUMN IF NOT EXISTS consecutivo VARCHAR(20) UNIQUE;

-- 2. Función para generar consecutivo (race-safe con advisory lock)
CREATE OR REPLACE FUNCTION generar_consecutivo_renuncia()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_seq INT;
  v_consecutivo TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::TEXT;

  -- Lock exclusivo por año para evitar race condition en inserts concurrentes
  PERFORM pg_advisory_xact_lock(hashtext('renuncia_consecutivo_' || v_year));

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(consecutivo FROM 'REN-\d{4}-(\d+)') AS INT)
  ), 0) + 1
  INTO v_seq
  FROM renuncias
  WHERE consecutivo LIKE 'REN-' || v_year || '-%';

  v_consecutivo := 'REN-' || v_year || '-' || LPAD(v_seq::TEXT, 3, '0');
  NEW.consecutivo := v_consecutivo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger BEFORE INSERT
DROP TRIGGER IF EXISTS trg_generar_consecutivo_renuncia ON renuncias;
CREATE TRIGGER trg_generar_consecutivo_renuncia
BEFORE INSERT ON renuncias
FOR EACH ROW
EXECUTE FUNCTION generar_consecutivo_renuncia();

-- 4. Backfill renuncias existentes (determinístico por fecha + id)
WITH numbered AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY fecha_creacion ASC, id ASC) AS seq,
         EXTRACT(YEAR FROM fecha_creacion)::TEXT AS yr
  FROM renuncias
  WHERE consecutivo IS NULL
)
UPDATE renuncias r
SET consecutivo = 'REN-' || n.yr || '-' || LPAD(n.seq::TEXT, 3, '0')
FROM numbered n
WHERE r.id = n.id;

-- 5. Hacer NOT NULL después del backfill
ALTER TABLE renuncias ALTER COLUMN consecutivo SET NOT NULL;

-- 6. Recrear vista v_renuncias_completas (DROP + CREATE porque r.* cambió)
DROP VIEW IF EXISTS v_renuncias_completas;
CREATE VIEW v_renuncias_completas AS
SELECT
  r.*,
  c.nombre_completo AS cliente_nombre,
  c.numero_documento AS cliente_documento,
  c.telefono        AS cliente_telefono,
  c.tipo_documento  AS cliente_tipo_documento,
  v.numero          AS vivienda_numero,
  m.nombre          AS manzana_nombre,
  p.id              AS proyecto_id,
  p.nombre          AS proyecto_nombre,
  n.valor_total     AS negociacion_valor_total,
  n.valor_total_pagar AS negociacion_valor_total_pagar,
  EXTRACT(DAY FROM (NOW() - r.fecha_renuncia))::INTEGER AS dias_desde_renuncia
FROM renuncias r
INNER JOIN negociaciones n ON n.id = r.negociacion_id
INNER JOIN clientes c ON c.id = r.cliente_id
INNER JOIN viviendas v ON v.id = r.vivienda_id
INNER JOIN manzanas m ON m.id = v.manzana_id
INNER JOIN proyectos p ON p.id = m.proyecto_id
ORDER BY r.fecha_renuncia DESC;

-- 7. Verificar
SELECT consecutivo, motivo, estado, fecha_creacion
FROM renuncias
ORDER BY fecha_creacion ASC;
