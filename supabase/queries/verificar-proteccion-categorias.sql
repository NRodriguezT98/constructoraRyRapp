-- ============================================
-- VERIFICAR PROTECCIÓN DE CATEGORÍAS
-- ============================================

-- 1. Verificar que existe la columna es_sistema
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'categorias_documento'
  AND column_name = 'es_sistema';

-- 2. Verificar categorías marcadas como sistema
SELECT
  id,
  nombre,
  es_sistema,
  es_global,
  modulos_permitidos
FROM categorias_documento
WHERE es_sistema = true
ORDER BY nombre;

-- 3. Verificar que existe el trigger
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_proteger_categoria_sistema';

-- 4. Verificar que existe la función
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'prevenir_eliminacion_categoria_sistema';
