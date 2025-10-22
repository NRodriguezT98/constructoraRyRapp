-- =====================================================
-- MIGRACIÓN 002: ACTUALIZAR ESTADOS DE VIVIENDAS
-- =====================================================
-- Fecha: 2025-10-22
-- Descripción: Cambiar estados a 'Disponible', 'Asignada', 'Entregada'
-- Referencia: docs/DEFINICION-ESTADOS-SISTEMA.md
-- =====================================================

-- PASO 1: Ver estados actuales (para auditoría)
DO $$
BEGIN
  RAISE NOTICE 'Estados actuales de viviendas:';
END $$;

-- Consulta de auditoría (ejecutar manualmente):
-- SELECT estado, COUNT(*) FROM viviendas GROUP BY estado;

-- PASO 2: Eliminar constraint actual
ALTER TABLE public.viviendas
DROP CONSTRAINT IF EXISTS viviendas_estado_check;

-- PASO 3: Migrar datos existentes a nuevos estados
-- Mapeo de estados antiguos a nuevos:
-- 'Disponible' → 'Disponible' (sin cambio)
-- 'Reservada' → 'Asignada' (si existe)
-- 'Vendida' → 'Entregada' (si existe)
-- Otros → 'Disponible' (por defecto)

UPDATE public.viviendas
SET estado = CASE
  WHEN estado = 'Disponible' THEN 'Disponible'
  WHEN estado = 'Reservada' THEN 'Asignada'
  WHEN estado = 'Vendida' THEN 'Entregada'
  WHEN estado = 'Asignada' THEN 'Asignada'  -- Si ya existe
  WHEN estado = 'Entregada' THEN 'Entregada'  -- Si ya existe
  ELSE 'Disponible'  -- Cualquier otro estado
END
WHERE estado IS NOT NULL;

-- PASO 4: Crear nuevo constraint
ALTER TABLE public.viviendas
ADD CONSTRAINT viviendas_estado_check CHECK (
  ((estado)::text = ANY ((ARRAY[
    'Disponible'::character varying,
    'Asignada'::character varying,
    'Entregada'::character varying
  ])::text[]))
);

-- PASO 5: Agregar campos si no existen (para vinculación con negociaciones)
ALTER TABLE public.viviendas
ADD COLUMN IF NOT EXISTS negociacion_id UUID NULL REFERENCES public.negociaciones(id) ON DELETE SET NULL;

ALTER TABLE public.viviendas
ADD COLUMN IF NOT EXISTS fecha_entrega TIMESTAMP WITH TIME ZONE NULL;

-- PASO 6: Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_viviendas_negociacion
ON public.viviendas(negociacion_id)
WHERE negociacion_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_viviendas_estado_asignada
ON public.viviendas(estado, cliente_id)
WHERE estado = 'Asignada';

CREATE INDEX IF NOT EXISTS idx_viviendas_fecha_entrega
ON public.viviendas(fecha_entrega DESC)
WHERE fecha_entrega IS NOT NULL;

-- PASO 7: Constraint para asegurar integridad
-- Vivienda 'Asignada' debe tener cliente_id
ALTER TABLE public.viviendas
DROP CONSTRAINT IF EXISTS viviendas_asignada_tiene_cliente;

ALTER TABLE public.viviendas
ADD CONSTRAINT viviendas_asignada_tiene_cliente CHECK (
  (estado != 'Asignada') OR (estado = 'Asignada' AND cliente_id IS NOT NULL)
);

-- Vivienda 'Entregada' debe tener fecha_entrega
ALTER TABLE public.viviendas
DROP CONSTRAINT IF EXISTS viviendas_entregada_tiene_fecha;

ALTER TABLE public.viviendas
ADD CONSTRAINT viviendas_entregada_tiene_fecha CHECK (
  (estado != 'Entregada') OR (estado = 'Entregada' AND fecha_entrega IS NOT NULL)
);

-- PASO 8: Comentarios para documentación
COMMENT ON CONSTRAINT viviendas_estado_check ON public.viviendas IS
'Estados: Disponible (sin cliente), Asignada (cliente pagando 0-99%), Entregada (100% pagado + entregada físicamente)';

COMMENT ON COLUMN public.viviendas.negociacion_id IS
'ID de la negociación/venta activa asociada a esta vivienda (NULL si disponible)';

COMMENT ON COLUMN public.viviendas.fecha_entrega IS
'Fecha en que la vivienda fue entregada físicamente al cliente (requerida si estado = Entregada)';

-- =====================================================
-- VALIDACIÓN POST-MIGRACIÓN
-- =====================================================
-- Ejecutar para verificar:
-- SELECT estado, COUNT(*) FROM viviendas GROUP BY estado;
-- SELECT COUNT(*) FROM viviendas WHERE estado = 'Asignada' AND cliente_id IS NULL; -- Debe ser 0
-- SELECT COUNT(*) FROM viviendas WHERE estado = 'Entregada' AND fecha_entrega IS NULL; -- Debe ser 0
-- =====================================================

-- ROLLBACK (en caso de error):
-- Restaurar estados antiguos si es necesario
-- UPDATE public.viviendas SET estado = 'Disponible' WHERE estado IN ('Asignada', 'Entregada');
