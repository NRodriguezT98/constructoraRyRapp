-- ==================================================
-- CONSULTA: Verificar historial de versiones de negociación
-- ==================================================

-- 1. Ver versiones actuales de la negociación
SELECT
  id,
  version_actual,
  version_lock,
  fecha_ultima_modificacion,
  estado,
  valor_negociado
FROM negociaciones
WHERE cliente_id = (
  SELECT id FROM clientes
  WHERE LOWER(nombres || ' ' || apellidos) LIKE '%luis david%'
  LIMIT 1
);

-- 2. Ver historial completo de cambios (snapshots)
SELECT
  nh.version,
  nh.tipo_cambio,
  nh.razon_cambio,
  nh.fecha_cambio,
  nh.campos_modificados,
  nh.fuentes_pago_snapshot,
  n.estado AS estado_negociacion
FROM negociaciones_historial nh
JOIN negociaciones n ON nh.negociacion_id = n.id
WHERE n.cliente_id = (
  SELECT id FROM clientes
  WHERE LOWER(nombres || ' ' || apellidos) LIKE '%luis david%'
  LIMIT 1
)
ORDER BY nh.version DESC;

-- 3. Ver fuentes de pago activas e inactivas
SELECT
  id,
  tipo,
  monto_aprobado,
  monto_recibido,
  estado_fuente,
  reemplazada_por,
  razon_inactivacion,
  fecha_creacion,
  fecha_inactivacion
FROM fuentes_pago
WHERE negociacion_id = (
  SELECT id FROM negociaciones
  WHERE cliente_id = (
    SELECT id FROM clientes
    WHERE LOWER(nombres || ' ' || apellidos) LIKE '%luis david%'
    LIMIT 1
  )
  LIMIT 1
)
ORDER BY fecha_creacion DESC;

-- 4. Resumen: ¿Cuántas versiones hay?
SELECT
  n.id AS negociacion_id,
  n.version_actual,
  n.version_lock,
  COUNT(nh.id) AS total_snapshots,
  MAX(nh.fecha_cambio) AS ultimo_cambio
FROM negociaciones n
LEFT JOIN negociaciones_historial nh ON n.id = nh.negociacion_id
WHERE n.cliente_id = (
  SELECT id FROM clientes
  WHERE LOWER(nombres || ' ' || apellidos) LIKE '%luis david%'
  LIMIT 1
)
GROUP BY n.id, n.version_actual, n.version_lock;
