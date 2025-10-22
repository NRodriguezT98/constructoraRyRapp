-- =====================================================
-- MIGRACIÓN 003: ACTUALIZAR ESTADOS DE NEGOCIACIONES
-- =====================================================
-- Fecha: 2025-10-22
-- Descripción: Cambiar estados a 'Activa', 'Suspendida', 'Cerrada por Renuncia', 'Completada'
-- Referencia: docs/DEFINICION-ESTADOS-SISTEMA.md
-- =====================================================

-- PASO 1: Ver estados actuales (para auditoría)
DO $$
BEGIN
  RAISE NOTICE 'Estados actuales de negociaciones:';
END $$;

-- Consulta de auditoría (ejecutar manualmente):
-- SELECT estado, COUNT(*) FROM negociaciones GROUP BY estado;

-- PASO 2: Eliminar constraint actual
ALTER TABLE public.negociaciones
DROP CONSTRAINT IF EXISTS negociaciones_estado_check;

-- PASO 3: Migrar datos existentes a nuevos estados
-- Mapeo de estados antiguos a nuevos:
-- 'En Proceso' → 'Activa'
-- 'Cierre Financiero' → 'Activa' (es parte del proceso activo)
-- 'Activa' → 'Activa' (sin cambio si ya existe)
-- 'Renuncia' → 'Cerrada por Renuncia'
-- 'Cancelada' → 'Cerrada por Renuncia' (se unifica)
-- 'Completada' → 'Completada' (sin cambio)

UPDATE public.negociaciones
SET estado = CASE
  WHEN estado = 'En Proceso' THEN 'Activa'
  WHEN estado = 'Cierre Financiero' THEN 'Activa'
  WHEN estado = 'Activa' THEN 'Activa'
  WHEN estado = 'Renuncia' THEN 'Cerrada por Renuncia'
  WHEN estado = 'Cancelada' THEN 'Cerrada por Renuncia'
  WHEN estado = 'Completada' THEN 'Completada'
  ELSE 'Activa'  -- Por defecto
END
WHERE estado IS NOT NULL;

-- PASO 4: Crear nuevo constraint
ALTER TABLE public.negociaciones
ADD CONSTRAINT negociaciones_estado_check CHECK (
  ((estado)::text = ANY ((ARRAY[
    'Activa'::character varying,
    'Suspendida'::character varying,
    'Cerrada por Renuncia'::character varying,
    'Completada'::character varying
  ])::text[]))
);

-- PASO 5: Agregar campos relacionados con renuncia y completado
ALTER TABLE public.negociaciones
ADD COLUMN IF NOT EXISTS fecha_renuncia_efectiva TIMESTAMP WITH TIME ZONE NULL;

ALTER TABLE public.negociaciones
ADD COLUMN IF NOT EXISTS fecha_completada TIMESTAMP WITH TIME ZONE NULL;

-- PASO 6: Actualizar campos para negociaciones completadas
UPDATE public.negociaciones
SET fecha_completada = fecha_actualizacion
WHERE estado = 'Completada' AND fecha_completada IS NULL;

-- Actualizar fecha_renuncia_efectiva para negociaciones cerradas por renuncia
UPDATE public.negociaciones
SET fecha_renuncia_efectiva = fecha_actualizacion
WHERE estado = 'Cerrada por Renuncia' AND fecha_renuncia_efectiva IS NULL;

-- PASO 7: Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_negociaciones_estado_activa
ON public.negociaciones(estado, cliente_id)
WHERE estado = 'Activa';

CREATE INDEX IF NOT EXISTS idx_negociaciones_estado_suspendida
ON public.negociaciones(estado)
WHERE estado = 'Suspendida';

CREATE INDEX IF NOT EXISTS idx_negociaciones_completadas
ON public.negociaciones(fecha_completada DESC)
WHERE estado = 'Completada';

CREATE INDEX IF NOT EXISTS idx_negociaciones_renuncias
ON public.negociaciones(fecha_renuncia_efectiva DESC)
WHERE estado = 'Cerrada por Renuncia';

-- PASO 8: Constraints de integridad
-- Negociación 'Completada' debe tener porcentaje 100
-- NOTA: Solo aplica si la columna porcentaje_completado existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'negociaciones' AND column_name = 'porcentaje_completado'
  ) THEN
    ALTER TABLE public.negociaciones
    DROP CONSTRAINT IF EXISTS negociaciones_completada_100;

    ALTER TABLE public.negociaciones
    ADD CONSTRAINT negociaciones_completada_100 CHECK (
      (estado != 'Completada') OR
      (estado = 'Completada' AND porcentaje_completado = 100)
    );
  END IF;
END $$;

-- Negociación 'Completada' debe tener fecha_completada
ALTER TABLE public.negociaciones
DROP CONSTRAINT IF EXISTS negociaciones_completada_fecha;

ALTER TABLE public.negociaciones
ADD CONSTRAINT negociaciones_completada_fecha CHECK (
  (estado != 'Completada') OR
  (estado = 'Completada' AND fecha_completada IS NOT NULL)
);

-- Negociación 'Cerrada por Renuncia' debe tener fecha_renuncia_efectiva
ALTER TABLE public.negociaciones
DROP CONSTRAINT IF EXISTS negociaciones_renuncia_fecha;

ALTER TABLE public.negociaciones
ADD CONSTRAINT negociaciones_renuncia_fecha CHECK (
  (estado != 'Cerrada por Renuncia') OR
  (estado = 'Cerrada por Renuncia' AND fecha_renuncia_efectiva IS NOT NULL)
);

-- PASO 9: Comentarios para documentación
COMMENT ON CONSTRAINT negociaciones_estado_check ON public.negociaciones IS
'Estados: Activa (recibiendo abonos), Suspendida (en trámite renuncia), Cerrada por Renuncia (renuncia confirmada), Completada (100% pagado + entregado)';

COMMENT ON COLUMN public.negociaciones.fecha_renuncia_efectiva IS
'Fecha en que la renuncia se hizo efectiva (requerida si estado = Cerrada por Renuncia)';

COMMENT ON COLUMN public.negociaciones.fecha_completada IS
'Fecha en que la negociación/venta se completó al 100% (requerida si estado = Completada)';

-- =====================================================
-- VALIDACIÓN POST-MIGRACIÓN
-- =====================================================
-- Ejecutar para verificar:
-- SELECT estado, COUNT(*) FROM negociaciones GROUP BY estado;
-- SELECT COUNT(*) FROM negociaciones WHERE estado = 'Completada' AND porcentaje_completado != 100; -- Debe ser 0
-- SELECT COUNT(*) FROM negociaciones WHERE estado = 'Completada' AND fecha_completada IS NULL; -- Debe ser 0
-- =====================================================

-- ROLLBACK (en caso de error):
-- UPDATE public.negociaciones SET estado = 'En Proceso' WHERE estado = 'Activa';
-- UPDATE public.negociaciones SET estado = 'Renuncia' WHERE estado = 'Cerrada por Renuncia';
