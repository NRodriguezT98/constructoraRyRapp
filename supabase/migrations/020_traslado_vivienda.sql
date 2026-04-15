-- =====================================================
-- MIGRACIÓN: Traslado de Vivienda
-- =====================================================
-- Agrega el estado 'Cerrada por Traslado' a negociaciones
-- y campos para mantener la trazabilidad del traslado.
-- =====================================================

BEGIN;

-- ==========================================
-- PASO 1: Agregar nuevo estado a negociaciones
-- ==========================================
ALTER TABLE public.negociaciones
DROP CONSTRAINT IF EXISTS negociaciones_estado_check;

ALTER TABLE public.negociaciones
ADD CONSTRAINT negociaciones_estado_check CHECK (
  ((estado)::text = ANY ((ARRAY[
    'Activa'::character varying,
    'Suspendida'::character varying,
    'Cerrada por Renuncia'::character varying,
    'Cerrada por Traslado'::character varying,
    'Completada'::character varying
  ])::text[]))
);

COMMENT ON CONSTRAINT negociaciones_estado_check ON public.negociaciones IS
'Estados válidos: Activa, Suspendida, Cerrada por Renuncia, Cerrada por Traslado, Completada';

-- ==========================================
-- PASO 2: Agregar campos de traslado a negociaciones
-- ==========================================
ALTER TABLE public.negociaciones
  ADD COLUMN IF NOT EXISTS negociacion_origen_id UUID REFERENCES public.negociaciones(id),
  ADD COLUMN IF NOT EXISTS traslado_destino_id UUID REFERENCES public.negociaciones(id),
  ADD COLUMN IF NOT EXISTS motivo_traslado TEXT,
  ADD COLUMN IF NOT EXISTS autorizado_por TEXT,
  ADD COLUMN IF NOT EXISTS fecha_traslado TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_negociaciones_origen
  ON public.negociaciones(negociacion_origen_id)
  WHERE negociacion_origen_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_negociaciones_traslado_destino
  ON public.negociaciones(traslado_destino_id)
  WHERE traslado_destino_id IS NOT NULL;

COMMENT ON COLUMN public.negociaciones.negociacion_origen_id IS
'Si esta negociación nació de un traslado, apunta a la negociación original';
COMMENT ON COLUMN public.negociaciones.traslado_destino_id IS
'Si esta negociación fue trasladada, apunta a la negociación destino';
COMMENT ON COLUMN public.negociaciones.motivo_traslado IS
'Motivo por el cual se realizó el traslado de vivienda';
COMMENT ON COLUMN public.negociaciones.autorizado_por IS
'Nombre de la persona que autorizó el traslado';
COMMENT ON COLUMN public.negociaciones.fecha_traslado IS
'Fecha en que se ejecutó el traslado';

-- ==========================================
-- PASO 3: Agregar campo de traslado a abonos_historial
-- ==========================================
ALTER TABLE public.abonos_historial
  ADD COLUMN IF NOT EXISTS trasladado_desde_negociacion_id UUID REFERENCES public.negociaciones(id);

CREATE INDEX IF NOT EXISTS idx_abonos_trasladados
  ON public.abonos_historial(trasladado_desde_negociacion_id)
  WHERE trasladado_desde_negociacion_id IS NOT NULL;

COMMENT ON COLUMN public.abonos_historial.trasladado_desde_negociacion_id IS
'Si el abono fue trasladado desde otra negociación, apunta a la negociación origen';

COMMIT;
