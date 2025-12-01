-- =====================================================
-- MIGRACIÓN: Eliminar campo 'origen' de clientes
-- Fecha: 2025-11-22
-- Razón: Simplificación del módulo de clientes
-- =====================================================

-- 1. Eliminar columna origen de tabla clientes
ALTER TABLE clientes
DROP COLUMN IF EXISTS origen CASCADE;

-- 2. Eliminar columna referido_por (relacionada con origen='Referido')
ALTER TABLE clientes
DROP COLUMN IF EXISTS referido_por CASCADE;

-- 3. Actualizar vista vista_clientes_resumen (ya no incluirá origen)
DROP VIEW IF EXISTS public.vista_clientes_resumen CASCADE;
CREATE OR REPLACE VIEW public.vista_clientes_resumen AS
SELECT
  c.id,
  c.nombre_completo,
  c.tipo_documento,
  c.numero_documento,
  c.telefono,
  c.email,
  c.estado,
  c.fecha_creacion,
  COUNT(n.id) as total_negociaciones,
  COUNT(CASE WHEN n.estado = 'Activa' THEN 1 END) as negociaciones_activas,
  COUNT(CASE WHEN n.estado = 'Completada' THEN 1 END) as negociaciones_completadas,
  MAX(n.fecha_creacion) as ultima_negociacion
FROM clientes c
LEFT JOIN negociaciones n ON c.id = n.cliente_id
GROUP BY c.id;

-- ✅ COMPLETADO: Campo 'origen' eliminado del sistema
