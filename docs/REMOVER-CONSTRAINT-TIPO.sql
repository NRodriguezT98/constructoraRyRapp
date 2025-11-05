-- =====================================================
-- Remover constraint UNIQUE del campo 'tipo'
-- en tabla configuracion_recargos
-- =====================================================

-- El error que estamos resolviendo:
-- "duplicate key value violates unique constraint configuracion_recargos_tipo_key"

-- PASO 1: Eliminar el constraint UNIQUE del campo 'tipo'
ALTER TABLE configuracion_recargos
DROP CONSTRAINT IF EXISTS configuracion_recargos_tipo_key;

-- PASO 2: Verificar que se eliminó correctamente
-- Ejecutar esta query para confirmar:
/*
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'configuracion_recargos'::regclass
  AND contype = 'u'
ORDER BY conname;
*/

-- =====================================================
-- Explicación
-- =====================================================
-- El constraint UNIQUE en 'tipo' impide tener múltiples recargos del mismo tipo.
-- Al eliminarlo, ahora podemos tener:
--   - Múltiples recargos_esquinera_5m con diferentes nombres
--   - Múltiples recargos_esquinera_10m con diferentes valores
--   - Etc.
--
-- Cada recargo será identificado por su ID único (PK).
-- El campo 'tipo' ahora es solo una categoría, no una clave única.

-- =====================================================
-- Resultado esperado después de ejecutar
-- =====================================================
-- Podrás crear recargos como:
-- | tipo                  | nombre                      | valor    | activo |
-- |-----------------------|-----------------------------|----------|--------|
-- | gastos_notariales     | Gastos Notariales 2025      | 5000000  | true   |
-- | recargo_esquinera_5m  | Recargo Esquinera Simple    | 5000000  | true   |
-- | recargo_esquinera_10m | Recargo Esquinera Doble     | 10000000 | true   |
-- | recargo_esquinera_12m | Recargo Esquinera Triple    | 12000000 | true   |
-- | recargo_esquinera_15m | Recargo Esquinera Premium   | 15000000 | true   |
