-- Script SQL para actualizar el documento con entidad COMFANDI
-- Ejecutar en Supabase SQL Editor (Dashboard → SQL Editor)

-- 1. Verificar documento actual
SELECT
  id,
  titulo,
  metadata
FROM documentos_cliente
WHERE titulo = 'Carta de Aprobación Subsidio Caja Compensación - A2 Juan carlos';

-- 2. Actualizar metadata.entidad a COMFANDI
UPDATE documentos_cliente
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{entidad}',
  '"COMFANDI"'
)
WHERE titulo = 'Carta de Aprobación Subsidio Caja Compensación - A2 Juan carlos';

-- 3. Verificar actualización
SELECT
  id,
  titulo,
  metadata->>'entidad' as entidad_financiera,
  metadata
FROM documentos_cliente
WHERE titulo = 'Carta de Aprobación Subsidio Caja Compensación - A2 Juan carlos';
