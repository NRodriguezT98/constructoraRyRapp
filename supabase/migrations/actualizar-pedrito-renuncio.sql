-- ============================================
-- LIMPIEZA: Actualizar cliente Pedrito a "Renunció"
-- ============================================
-- Propósito: Corregir el estado del cliente que quedó en limbo
-- después de la desvinculación fallida
-- ============================================

-- 1. Verificar estado actual del cliente Pedrito
SELECT
  'ANTES' as momento,
  id,
  nombres || ' ' || apellidos as nombre_completo,
  numero_documento,
  estado as estado_actual
FROM clientes
WHERE nombres ILIKE '%Pedrito%' AND apellidos ILIKE '%Perez%';

-- 2. Actualizar a "Renunció"
UPDATE clientes
SET estado = 'Renunció',
    fecha_actualizacion = NOW()
WHERE nombres ILIKE '%Pedrito%'
  AND apellidos ILIKE '%Perez%'
  AND estado = 'Activo';

-- 3. Verificar cambio
SELECT
  'DESPUES' as momento,
  id,
  nombres || ' ' || apellidos as nombre_completo,
  numero_documento,
  estado as estado_nuevo
FROM clientes
WHERE nombres ILIKE '%Pedrito%' AND apellidos ILIKE '%Perez%';
