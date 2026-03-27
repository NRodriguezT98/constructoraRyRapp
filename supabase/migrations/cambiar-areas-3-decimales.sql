-- Migración: Cambiar área de lote y área construida a 3 decimales
-- Motivo: Las áreas de viviendas se manejan con 3 decimales (ej: 66.125)

-- 1. Eliminar vista dependiente
DROP VIEW IF EXISTS vista_viviendas_completas;

-- 2. Alterar columnas
ALTER TABLE viviendas
  ALTER COLUMN area_lote TYPE numeric(10, 3),
  ALTER COLUMN area_construida TYPE numeric(10, 3);

-- 3. Recrear vista
CREATE OR REPLACE VIEW vista_viviendas_completas AS
SELECT v.id,
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
    m.nombre AS manzana_nombre,
    m.proyecto_id,
    p.nombre AS proyecto_nombre,
    p.estado AS proyecto_estado,
    c.id AS cliente_id_data,
    c.nombres AS cliente_nombres,
    c.apellidos AS cliente_apellidos,
    c.telefono AS cliente_telefono,
    c.email AS cliente_email,
    COALESCE(sum(ah.monto), 0::numeric) AS total_abonado,
    count(ah.id) AS cantidad_abonos,
    CASE
        WHEN (v.valor_total > 0::numeric) THEN round(((COALESCE(sum(ah.monto), 0::numeric) / v.valor_total) * 100::numeric), 2)
        ELSE 0::numeric
    END AS porcentaje_pagado,
    (v.valor_total - COALESCE(sum(ah.monto), 0::numeric)) AS saldo_pendiente
FROM ((((viviendas v
     LEFT JOIN manzanas m ON ((v.manzana_id = m.id)))
     LEFT JOIN proyectos p ON ((m.proyecto_id = p.id)))
     LEFT JOIN clientes c ON ((v.cliente_id = c.id)))
     LEFT JOIN abonos_historial ah ON (((v.negociacion_id = ah.negociacion_id) AND (ah.estado = 'Activo'::text))))
GROUP BY v.id, v.manzana_id, v.numero, v.estado, v.cliente_id, v.negociacion_id,
    v.lindero_norte, v.lindero_sur, v.lindero_oriente, v.lindero_occidente,
    v.matricula_inmobiliaria, v.nomenclatura, v.area, v.area_lote, v.area_construida,
    v.tipo_vivienda, v.certificado_tradicion_url, v.valor_base, v.es_esquinera,
    v.recargo_esquinera, v.gastos_notariales, v.valor_total, v.fecha_creacion,
    v.fecha_actualizacion, m.nombre, m.proyecto_id, p.nombre, p.estado,
    c.id, c.nombres, c.apellidos, c.telefono, c.email;
