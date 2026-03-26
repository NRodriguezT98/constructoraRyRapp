-- =====================================================
-- FIX: Agregar formulario_renuncia_url a vista v_renuncias_completas
-- =====================================================
-- La vista usaba columnas explícitas y no incluía la nueva columna.
-- Necesitamos DROP + CREATE porque la posición de columnas cambia.
-- =====================================================

DROP VIEW IF EXISTS v_renuncias_completas;

CREATE VIEW v_renuncias_completas AS
SELECT
    r.id,
    r.vivienda_id,
    r.cliente_id,
    r.motivo,
    r.fecha_renuncia,
    r.monto_a_devolver,
    r.estado,
    r.fecha_creacion,
    r.fecha_actualizacion,
    r.negociacion_id,
    r.vivienda_valor_snapshot,
    r.abonos_snapshot,
    r.requiere_devolucion,
    r.fecha_devolucion,
    r.comprobante_devolucion_url,
    r.metodo_devolucion,
    r.numero_comprobante,
    r.fecha_cierre,
    r.usuario_registro,
    r.usuario_cierre,
    r.retencion_monto,
    r.retencion_motivo,
    r.vivienda_datos_snapshot,
    r.cliente_datos_snapshot,
    r.negociacion_datos_snapshot,
    r.notas_cierre,
    r.consecutivo,
    r.formulario_renuncia_url,
    -- Joins
    c.nombre_completo AS cliente_nombre,
    c.numero_documento AS cliente_documento,
    c.telefono AS cliente_telefono,
    c.tipo_documento AS cliente_tipo_documento,
    v.numero AS vivienda_numero,
    m.nombre AS manzana_nombre,
    p.id AS proyecto_id,
    p.nombre AS proyecto_nombre,
    n.valor_total AS negociacion_valor_total,
    n.valor_total_pagar AS negociacion_valor_total_pagar,
    EXTRACT(day FROM now() - r.fecha_renuncia)::integer AS dias_desde_renuncia
FROM renuncias r
    JOIN negociaciones n ON n.id = r.negociacion_id
    JOIN clientes c ON c.id = r.cliente_id
    JOIN viviendas v ON v.id = r.vivienda_id
    JOIN manzanas m ON m.id = v.manzana_id
    JOIN proyectos p ON p.id = m.proyecto_id
ORDER BY r.fecha_renuncia DESC;

-- Verificación
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'v_renuncias_completas'
  AND column_name = 'formulario_renuncia_url';
