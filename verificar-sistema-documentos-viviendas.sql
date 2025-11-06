-- ============================================================================
-- VERIFICACIÓN: Sistema de Documentos para Viviendas
-- Ejecutar en Supabase Studio → SQL Editor para verificar instalación
-- ============================================================================

-- 1. Verificar que la tabla documentos_vivienda existe
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'documentos_vivienda';
-- Debe retornar 1 fila: documentos_vivienda | BASE TABLE

-- 2. Verificar columnas de la tabla
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'documentos_vivienda'
ORDER BY ordinal_position;
-- Debe retornar 17 columnas

-- 3. Verificar que la columna es_sistema existe en categorias_documento
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'categorias_documento'
  AND column_name = 'es_sistema';
-- Debe retornar 1 fila: es_sistema | boolean | false

-- 4. Verificar categorías del sistema creadas
SELECT
  nombre,
  color,
  icono,
  es_sistema,
  modulos_permitidos,
  orden
FROM categorias_documento
WHERE 'viviendas' = ANY(modulos_permitidos)
  AND es_sistema = true
ORDER BY orden;
-- Debe retornar 8 categorías

-- 5. Contar categorías por módulo
SELECT
  UNNEST(modulos_permitidos) AS modulo,
  COUNT(*) AS total_categorias,
  SUM(CASE WHEN es_sistema THEN 1 ELSE 0 END) AS categorias_sistema
FROM categorias_documento
GROUP BY modulo
ORDER BY modulo;

-- 6. Verificar índices creados
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'documentos_vivienda'
ORDER BY indexname;
-- Debe retornar 6 índices

-- 7. Verificar políticas RLS
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('documentos_vivienda', 'categorias_documento')
ORDER BY tablename, cmd;

-- 8. Verificar vista creada
SELECT
  table_name,
  view_definition
FROM information_schema.views
WHERE table_name = 'vista_documentos_vivienda';
-- Debe retornar 1 fila

-- 9. Verificar función helper
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'obtener_categoria_sistema_vivienda';
-- Debe retornar 1 fila

-- 10. Probar función helper
SELECT obtener_categoria_sistema_vivienda('Certificado de Tradición');
-- Debe retornar un UUID

-- ============================================================================
-- RESUMEN DE VERIFICACIÓN
-- ============================================================================

SELECT
  '✅ Sistema de Documentos para Viviendas INSTALADO' AS status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'documentos_vivienda') AS tabla_documentos,
  (SELECT COUNT(*) FROM categorias_documento WHERE 'viviendas' = ANY(modulos_permitidos) AND es_sistema = true) AS categorias_sistema,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'documentos_vivienda') AS indices,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'documentos_vivienda') AS politicas_rls,
  (SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'vista_documentos_vivienda') AS vista;

-- Resultado esperado:
-- status: ✅ Sistema de Documentos para Viviendas INSTALADO
-- tabla_documentos: 1
-- categorias_sistema: 8
-- indices: 6
-- politicas_rls: 4
-- vista: 1
