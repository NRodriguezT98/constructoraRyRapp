-- =====================================================
-- MIGRACIÓN: Agregar tiene_documento_identidad a vista_clientes_resumen
-- =====================================================
-- Fecha: 2025-11-26
-- Objetivo: Agregar campo booleano que indica si el cliente tiene
--           documento de identidad subido (para mostrar indicador en cards)
-- =====================================================

BEGIN;

-- 1. Eliminar vista actual
DROP VIEW IF EXISTS public.vista_clientes_resumen CASCADE;

-- 2. Recrear vista con nuevo campo tiene_documento_identidad
CREATE OR REPLACE VIEW public.vista_clientes_resumen AS
SELECT
  c.id,
  c.nombre_completo,
  c.tipo_documento,
  c.numero_documento,
  c.telefono,
  c.email,
  c.estado,
  c.estado_civil,
  c.fecha_creacion,

  -- ⭐ NUEVO: Verificar si tiene documento de identidad subido
  EXISTS (
    SELECT 1
    FROM documentos_cliente dc
    WHERE dc.cliente_id = c.id
      AND dc.es_documento_identidad = true
      AND dc.estado != 'eliminado'
  ) as tiene_documento_identidad,

  -- Estadísticas de negociaciones
  COUNT(n.id) as total_negociaciones,
  COUNT(CASE WHEN n.estado = 'Activa' THEN 1 END) as negociaciones_activas,
  COUNT(CASE WHEN n.estado = 'Completada' THEN 1 END) as negociaciones_completadas,
  MAX(n.fecha_creacion) as ultima_negociacion

FROM clientes c
LEFT JOIN negociaciones n ON c.id = n.cliente_id
GROUP BY c.id;

-- 3. Agregar comentario
COMMENT ON VIEW public.vista_clientes_resumen IS 'Vista resumida de clientes con estadísticas de negociaciones e indicador de documento de identidad';

COMMIT;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver clientes con y sin documento
SELECT
  nombre_completo,
  estado,
  tiene_documento_identidad,
  total_negociaciones
FROM public.vista_clientes_resumen
ORDER BY fecha_creacion DESC
LIMIT 10;

-- Contar clientes por estado de documento
SELECT
  tiene_documento_identidad,
  COUNT(*) as total
FROM public.vista_clientes_resumen
GROUP BY tiene_documento_identidad;
