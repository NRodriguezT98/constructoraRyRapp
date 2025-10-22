-- =====================================================
-- MIGRACIÓN 001: ACTUALIZAR ESTADOS DE CLIENTES
-- =====================================================
-- Fecha: 2025-10-22
-- Descripción: Agregar estados 'En Proceso de Renuncia' y 'Propietario'
-- Referencia: docs/DEFINICION-ESTADOS-SISTEMA.md
-- =====================================================

-- PASO 1: Eliminar constraint actual
ALTER TABLE public.clientes
DROP CONSTRAINT IF EXISTS clientes_estado_check;

-- PASO 2: Crear nuevo constraint con todos los estados
ALTER TABLE public.clientes
ADD CONSTRAINT clientes_estado_check CHECK (
  ((estado)::text = ANY ((ARRAY[
    'Interesado'::character varying,
    'Activo'::character varying,
    'En Proceso de Renuncia'::character varying,  -- 🆕 NUEVO
    'Inactivo'::character varying,
    'Propietario'::character varying               -- 🆕 NUEVO
  ])::text[]))
);

-- PASO 3: Crear índice para optimizar búsquedas por nuevo estado
CREATE INDEX IF NOT EXISTS idx_clientes_estado_renuncia
ON public.clientes(estado)
WHERE estado = 'En Proceso de Renuncia';

CREATE INDEX IF NOT EXISTS idx_clientes_estado_propietario
ON public.clientes(estado)
WHERE estado = 'Propietario';

-- PASO 4: Comentarios para documentación
COMMENT ON CONSTRAINT clientes_estado_check ON public.clientes IS
'Estados: Interesado (sin venta), Activo (con venta vigente), En Proceso de Renuncia (renuncia iniciada), Inactivo (renuncia cerrada), Propietario (100% pagado + entregado)';

-- =====================================================
-- VALIDACIÓN POST-MIGRACIÓN
-- =====================================================
-- Ejecutar para verificar:
-- SELECT estado, COUNT(*) FROM clientes GROUP BY estado;
-- =====================================================

-- ROLLBACK (en caso de error):
-- ALTER TABLE public.clientes DROP CONSTRAINT clientes_estado_check;
-- ALTER TABLE public.clientes ADD CONSTRAINT clientes_estado_check CHECK (
--   ((estado)::text = ANY ((ARRAY['Interesado'::character varying, 'Activo'::character varying, 'Inactivo'::character varying])::text[]))
-- );
