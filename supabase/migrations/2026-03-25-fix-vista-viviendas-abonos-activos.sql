-- =====================================================
-- FIX: vista_viviendas_completas — filtrar abonos anulados
-- Fecha: 2026-03-25
--
-- PROBLEMA:
--   La vista sumaba TODOS los abonos incluyendo anulados.
--   Resultado: total_abonado inflado, porcentaje incorrecto,
--   desincronización con negociaciones.total_abonado (que sí filtra activos).
--
-- SOLUCIÓN:
--   Agregar AND ah.estado = 'Activo' al LEFT JOIN de abonos_historial.
-- =====================================================

DROP VIEW IF EXISTS vista_viviendas_completas;

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

  -- Cálculos de abonos — SOLO ACTIVOS (no anulados)
  COALESCE(SUM(ah.monto), 0) AS total_abonado,
  COUNT(ah.id) AS cantidad_abonos,

  -- Porcentaje basado en valor_total
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
-- ✅ CORREGIDO: solo abonos Activos
LEFT JOIN abonos_historial ah
  ON v.negociacion_id = ah.negociacion_id
  AND ah.estado = 'Activo'

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
  c.email;

COMMENT ON VIEW public.vista_viviendas_completas IS
  'Vista optimizada de viviendas con cálculos financieros. Solo suma abonos Activos (excluye Anulados).';
