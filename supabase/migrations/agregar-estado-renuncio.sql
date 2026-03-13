-- ============================================
-- MIGRACIÓN: Agregar estado "Renunció" a clientes
-- ============================================
-- Fecha: 2025-12-11
-- Propósito: Diferenciar clientes que renunciaron vs prospectos nuevos
-- ============================================

-- 1. Eliminar constraint existente
ALTER TABLE clientes
DROP CONSTRAINT IF EXISTS clientes_estado_check;

-- 2. Agregar nuevo constraint con estado "Renunció"
ALTER TABLE clientes
ADD CONSTRAINT clientes_estado_check
CHECK (estado IN (
  'Interesado',              -- Prospecto nuevo (nunca tuvo vivienda)
  'Activo',                  -- Con vivienda asignada y negociación activa
  'En Proceso de Renuncia',  -- En trámite de renuncia (documental)
  'Renunció',                -- Renunció a una vivienda (puede volver)
  'Inactivo',                -- No interesado / dado de baja
  'Propietario'              -- Completó compra (dueño con escrituras)
));

-- 3. Verificar constraint aplicado
SELECT
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'clientes_estado_check';
