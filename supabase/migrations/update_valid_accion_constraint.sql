-- Migración: Agregar 'ANULAR' al constraint valid_accion en audit_log
-- Actualmente solo permite: CREATE, UPDATE, DELETE
-- La anulación de abonos necesita el valor 'ANULAR'

ALTER TABLE audit_log
  DROP CONSTRAINT IF EXISTS valid_accion;

ALTER TABLE audit_log
  ADD CONSTRAINT valid_accion
  CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE', 'ANULAR'));

-- Verificar que quedó bien
SELECT pg_get_constraintdef(oid) AS constraint_actualizado
FROM pg_constraint
WHERE conname = 'valid_accion'
  AND conrelid = 'audit_log'::regclass;
