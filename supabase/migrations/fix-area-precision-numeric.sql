-- Migración: Cambiar tipo de columna area_lote y area_construida a NUMERIC
-- para preservar precisión decimal exacta (66.125 en lugar de 66.13)

BEGIN;

-- 1. Dropear vista que depende de las columnas
DROP VIEW IF EXISTS vista_viviendas_completas CASCADE;

-- 2. Cambiar area_lote de REAL a NUMERIC(10,3)
-- NUMERIC(10,3) = 10 dígitos totales, 3 decimales (ej: 9999999.125)
ALTER TABLE viviendas
ALTER COLUMN area_lote TYPE NUMERIC(10,3) USING area_lote::NUMERIC(10,3);

-- 3. Cambiar area_construida de REAL a NUMERIC(10,3)
ALTER TABLE viviendas
ALTER COLUMN area_construida TYPE NUMERIC(10,3) USING area_construida::NUMERIC(10,3);

-- 4. Cambiar columna legacy 'area' también
ALTER TABLE viviendas
ALTER COLUMN area TYPE NUMERIC(10,3) USING area::NUMERIC(10,3);

-- 5. Recrear la vista vista_viviendas_completas (copia de la vista original)
CREATE VIEW vista_viviendas_completas AS
SELECT
  -- Datos de la vivienda (tabla base)
  v.id,
  v.manzana_id,
  v.numero,
  v.estado,
  v.cliente_id,
  v.negociacion_id,

  -- Linderos
  v.lindero_norte,
  v.lindero_sur,
  v.lindero_oriente,
  v.lindero_occidente,

  -- Información Legal
  v.matricula_inmobiliaria,
  v.nomenclatura,
  v.area,
  v.area_lote,
  v.area_construida,
  v.tipo_vivienda,
  v.certificado_tradicion_url,

  -- Información Financiera
  v.valor_base,
  v.es_esquinera,
  v.recargo_esquinera,
  v.gastos_notariales,
  v.valor_total,

  -- Auditoría
  v.fecha_creacion,
  v.fecha_actualizacion,

  -- Datos de la manzana
  m.nombre AS manzana_nombre,
  m.proyecto_id,

  -- Datos del proyecto
  p.nombre AS proyecto_nombre,
  p.estado AS proyecto_estado,

  -- Datos del cliente (si tiene)
  c.id AS cliente_id_data,
  c.nombres AS cliente_nombres,
  c.apellidos AS cliente_apellidos,
  c.telefono AS cliente_telefono,
  c.email AS cliente_email,

  -- Cálculos de abonos (agregados)
  COALESCE(SUM(ah.monto), 0) AS total_abonado,
  COUNT(ah.id) AS cantidad_abonos,

  -- Cálculos derivados (calculados en SELECT)
  CASE
    WHEN v.valor_total > 0 THEN
      ROUND(((COALESCE(SUM(ah.monto), 0) / v.valor_total) * 100)::numeric, 2)
    ELSE 0
  END AS porcentaje_pagado,

  v.valor_total - COALESCE(SUM(ah.monto), 0) AS saldo_pendiente

FROM viviendas v
LEFT JOIN manzanas m ON v.manzana_id = m.id
LEFT JOIN proyectos p ON m.proyecto_id = p.id
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN abonos_historial ah ON v.negociacion_id = ah.negociacion_id

-- Agrupar por todos los campos no agregados
GROUP BY
  v.id,
  v.manzana_id,
  v.numero,
  v.estado,
  v.cliente_id,
  v.negociacion_id,
  v.lindero_norte,
  v.lindero_sur,
  v.lindero_oriente,
  v.lindero_occidente,
  v.matricula_inmobiliaria,
  v.nomenclatura,
  v.area,
  v.area_lote,
  v.area_construida,
  v.tipo_vivienda,
  v.certificado_tradicion_url,
  v.valor_base,
  v.es_esquinera,
  v.recargo_esquinera,
  v.gastos_notariales,
  v.valor_total,
  v.fecha_creacion,
  v.fecha_actualizacion,
  m.nombre,
  m.proyecto_id,
  p.nombre,
  p.estado,
  c.id,
  c.nombres,
  c.apellidos,
  c.telefono,
  c.email

-- Ordenar por fecha de creación más reciente primero
ORDER BY v.fecha_creacion DESC;

-- Permisos
ALTER VIEW vista_viviendas_completas OWNER TO postgres;
GRANT SELECT ON vista_viviendas_completas TO authenticated;
GRANT SELECT ON vista_viviendas_completas TO anon;

COMMIT;
