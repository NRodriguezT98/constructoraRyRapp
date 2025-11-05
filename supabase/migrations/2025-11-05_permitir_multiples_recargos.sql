-- =====================================================
-- MIGRACIÓN: Permitir múltiples recargos del mismo tipo
-- =====================================================
-- Fecha: 2025-11-05
-- Objetivo: Eliminar constraint UNIQUE del campo 'tipo' para permitir
--           múltiples recargos activos del mismo tipo (ej: varios recargos de esquinera)

-- =====================================================
-- PASO 1: Eliminar constraint UNIQUE
-- =====================================================

ALTER TABLE configuracion_recargos
DROP CONSTRAINT IF EXISTS configuracion_recargos_tipo_key;

-- =====================================================
-- PASO 2: Actualizar valores existentes (si existen)
-- =====================================================

-- Actualizar nombres para que sean únicos y descriptivos
UPDATE configuracion_recargos
SET nombre = 'Gastos Notariales 2025'
WHERE tipo = 'gastos_notariales'
  AND nombre = 'Gastos Notariales';

UPDATE configuracion_recargos
SET
  nombre = 'Recargo Esquinera Simple - $5M',
  tipo = 'recargo_esquinera_5m'
WHERE tipo = 'esquinera_5M';

UPDATE configuracion_recargos
SET
  nombre = 'Recargo Esquinera Doble - $10M',
  tipo = 'recargo_esquinera_10m'
WHERE tipo = 'esquinera_10M';

-- =====================================================
-- PASO 3: Agregar comentario a la columna
-- =====================================================

COMMENT ON COLUMN configuracion_recargos.tipo IS
'Categoría del recargo. Puede repetirse para tener múltiples opciones del mismo tipo. Ejemplos: gastos_notariales, recargo_esquinera_5m, recargo_esquinera_10m';

-- =====================================================
-- Verificación
-- =====================================================

-- Ver constraints actuales de la tabla:
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'configuracion_recargos'::regclass
ORDER BY conname;

-- Ver datos actuales:
SELECT id, tipo, nombre, valor, activo
FROM configuracion_recargos
ORDER BY tipo, valor;

-- =====================================================
-- Resultado esperado
-- =====================================================
-- Ahora podrás crear múltiples recargos como:
--
-- | tipo                  | nombre                        | valor    | activo |
-- |-----------------------|-------------------------------|----------|--------|
-- | gastos_notariales     | Gastos Notariales 2025        | 5000000  | true   |
-- | recargo_esquinera_5m  | Recargo Esquinera Simple      | 5000000  | true   |
-- | recargo_esquinera_10m | Recargo Esquinera Doble       | 10000000 | true   |
-- | recargo_esquinera_10m | Recargo Esquinera Doble Alt   | 10500000 | true   | ← AHORA POSIBLE
-- | recargo_esquinera_12m | Recargo Esquinera Triple      | 12000000 | true   |
