-- Hacer user_id opcional en categorias_documento
-- Las categorías de sistema no pertenecen a ningún usuario específico

ALTER TABLE categorias_documento
  ALTER COLUMN user_id DROP NOT NULL;

-- Verificar cambio
SELECT
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'categorias_documento'
  AND column_name = 'user_id';
