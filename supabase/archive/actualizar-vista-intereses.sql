-- =====================================================
-- ACTUALIZAR VISTA: intereses_completos
-- =====================================================
-- Incluye las nuevas columnas agregadas a cliente_intereses
-- =====================================================

CREATE OR REPLACE VIEW intereses_completos AS
SELECT
  i.id,
  i.cliente_id,
  i.proyecto_id,
  i.vivienda_id,
  i.estado,
  i.notas,
  i.motivo_descarte,
  i.fecha_interes,
  i.fecha_actualizacion,
  i.usuario_creacion,

  -- Nuevas columnas agregadas
  i.valor_estimado,
  i.origen,
  i.prioridad,
  i.fecha_ultimo_contacto,
  i.proximo_seguimiento,
  i.negociacion_id,
  i.fecha_conversion,

  -- Datos del cliente
  c.nombre as cliente_nombre,
  c.apellido as cliente_apellido,
  c.email as cliente_email,
  c.telefono as cliente_telefono,
  c.documento as cliente_documento,

  -- Datos del proyecto
  p.nombre as proyecto_nombre,
  p.estado as proyecto_estado,
  p.ubicacion as proyecto_ubicacion,

  -- Datos de la vivienda (si existe)
  v.numero as vivienda_numero,
  v.valor_total as vivienda_valor,
  v.estado as vivienda_estado,
  v.tipo as vivienda_tipo,
  m.nombre as manzana_nombre,

  -- Calculados: días desde el interés
  EXTRACT(DAY FROM NOW() - i.fecha_interes) as dias_desde_interes,

  -- Calculado: requiere seguimiento urgente
  CASE
    WHEN i.proximo_seguimiento IS NOT NULL
      AND i.proximo_seguimiento < NOW()
      AND i.estado IN ('Pendiente', 'Contactado', 'En Seguimiento', 'Activo')
    THEN true
    ELSE false
  END as seguimiento_urgente,

  -- Calculado: tiempo sin contacto (días)
  CASE
    WHEN i.fecha_ultimo_contacto IS NOT NULL
    THEN EXTRACT(DAY FROM NOW() - i.fecha_ultimo_contacto)
    ELSE NULL
  END as dias_sin_contacto

FROM cliente_intereses i
INNER JOIN clientes c ON i.cliente_id = c.id
INNER JOIN proyectos p ON i.proyecto_id = p.id
LEFT JOIN viviendas v ON i.vivienda_id = v.id
LEFT JOIN manzanas m ON v.manzana_id = m.id
ORDER BY i.fecha_interes DESC;

-- =====================================================
-- COMENTARIO DE LA VISTA
-- =====================================================
COMMENT ON VIEW intereses_completos IS
  'Vista completa de intereses con datos relacionados de clientes, proyectos y viviendas. Incluye campos calculados para seguimiento.';

-- =====================================================
-- VERIFICAR LA VISTA
-- =====================================================
SELECT * FROM intereses_completos LIMIT 5;

-- =====================================================
-- ✅ EJECUTAR EN SUPABASE DASHBOARD → SQL EDITOR
-- =====================================================
