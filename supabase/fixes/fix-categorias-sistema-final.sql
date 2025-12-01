-- ============================================
-- CORREGIR: Categorías del sistema (desactivar trigger temporalmente)
-- ============================================

-- 1. Desactivar trigger temporalmente
ALTER TABLE categorias_documento DISABLE TRIGGER trigger_proteger_categoria_sistema;

-- 2. Desmarcar las que se marcaron incorrectamente
UPDATE categorias_documento
SET es_sistema = false
WHERE es_sistema = true;

-- 3. Marcar SOLO la categoría crítica que usamos
UPDATE categorias_documento
SET es_sistema = true
WHERE id = '4898e798-c188-4f02-bfcf-b2b15be48e34'; -- Cartas de aprobación (ID fijo)

-- 4. Reactivar trigger
ALTER TABLE categorias_documento ENABLE TRIGGER trigger_proteger_categoria_sistema;

-- 5. Verificar resultado
SELECT
  id,
  nombre,
  es_sistema,
  modulos_permitidos
FROM categorias_documento
WHERE es_sistema = true;
