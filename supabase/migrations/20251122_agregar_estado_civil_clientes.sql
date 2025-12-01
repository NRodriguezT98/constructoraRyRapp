-- =====================================================
-- Migración: Agregar campo estado_civil a tabla clientes
-- Fecha: 2025-11-22
-- Descripción: Agrega columna estado_civil con enum para
--              almacenar el estado civil del cliente
-- =====================================================

-- 1. Crear tipo ENUM para estados civiles
CREATE TYPE estado_civil_enum AS ENUM (
  'Soltero(a)',
  'Casado(a)',
  'Unión libre',
  'Viudo(a)'
);

-- 2. Agregar columna estado_civil a tabla clientes
ALTER TABLE clientes
ADD COLUMN estado_civil estado_civil_enum;

-- 3. Comentario en la columna
COMMENT ON COLUMN clientes.estado_civil IS 'Estado civil del cliente: Soltero(a), Casado(a), Unión libre, Viudo(a)';

-- 4. Actualizar vista vista_clientes_resumen (si existe)
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
  c.estado_civil,
  c.notas,
  c.fecha_creacion,
  c.fecha_actualizacion,
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

-- 5. Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Migración completada: Campo estado_civil agregado exitosamente a tabla clientes';
END $$;
