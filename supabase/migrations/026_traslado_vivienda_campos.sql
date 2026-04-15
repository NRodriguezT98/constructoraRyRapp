-- ─────────────────────────────────────────────────────────────
-- Migración 026: Campos de traslado en negociaciones
-- ─────────────────────────────────────────────────────────────
-- Agrega los campos necesarios para registrar el traslado de
-- vivienda en la negociación nueva creada durante el proceso.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE negociaciones
  ADD COLUMN IF NOT EXISTS negociacion_origen_id uuid NULL REFERENCES negociaciones(id),
  ADD COLUMN IF NOT EXISTS motivo_traslado        text NULL,
  ADD COLUMN IF NOT EXISTS autorizado_por         text NULL,
  ADD COLUMN IF NOT EXISTS fecha_traslado         timestamp with time zone NULL;

-- Índice para facilitar búsqueda de negociaciones que son resultado de traslado
CREATE INDEX IF NOT EXISTS idx_negociaciones_origen_id
  ON negociaciones(negociacion_origen_id)
  WHERE negociacion_origen_id IS NOT NULL;

COMMENT ON COLUMN negociaciones.negociacion_origen_id IS 'Si es un traslado, referencia a la negociación original de la cual se trasladó';
COMMENT ON COLUMN negociaciones.motivo_traslado      IS 'Motivo del traslado de vivienda';
COMMENT ON COLUMN negociaciones.autorizado_por       IS 'Persona que autorizó el traslado';
COMMENT ON COLUMN negociaciones.fecha_traslado       IS 'Fecha en que se registró el traslado';

-- ─────────────────────────────────────────────────────────────
-- Fin de migración 026
-- ─────────────────────────────────────────────────────────────
