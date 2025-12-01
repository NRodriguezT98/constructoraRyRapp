-- =====================================================
-- Migración: Agregar fecha_nacimiento a vista_clientes_resumen
-- Fecha: 2025-11-27
-- Descripción: Agrega campo fecha_nacimiento a la vista
--              para mostrar edad en las cards de clientes
-- =====================================================

-- Recrear vista con fecha_nacimiento
DROP VIEW IF EXISTS vista_clientes_resumen CASCADE;

CREATE OR REPLACE VIEW vista_clientes_resumen AS
SELECT
  c.id,
  c.nombres,
  c.apellidos,
  c.nombres || ' ' || c.apellidos AS nombre_completo,
  c.tipo_documento,
  c.numero_documento,
  c.telefono,
  c.email,
  c.direccion,
  c.ciudad,
  c.departamento,
  c.estado,
  c.estado_civil,
  c.fecha_nacimiento,
  c.documento_identidad_url,
  c.documento_identidad_titulo,
  c.notas,
  c.fecha_creacion,
  c.fecha_actualizacion,
  -- Indicador de documento de identidad
  CASE
    WHEN c.documento_identidad_url IS NOT NULL AND c.documento_identidad_url != '' THEN true
    ELSE false
  END AS tiene_documento_identidad,
  -- Estadísticas
  COALESCE(
    (
      SELECT COUNT(*)
      FROM negociaciones n
      WHERE n.cliente_id = c.id
    ),
    0
  ) AS total_negociaciones,
  COALESCE(
    (
      SELECT COUNT(*)
      FROM negociaciones n
      WHERE n.cliente_id = c.id AND n.estado = 'Activa'
    ),
    0
  ) AS negociaciones_activas,
  COALESCE(
    (
      SELECT COUNT(*)
      FROM negociaciones n
      WHERE n.cliente_id = c.id AND n.estado = 'Completada'
    ),
    0
  ) AS negociaciones_completadas,
  0 AS total_intereses
FROM
  clientes c;

-- Comentario en la vista
COMMENT ON VIEW vista_clientes_resumen IS 'Vista resumen de clientes con estadísticas de negociaciones y campo fecha_nacimiento para calcular edad';

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración completada: fecha_nacimiento agregado a vista_clientes_resumen';
END $$;
