-- ============================================
-- 📊 VERIFICACIÓN ANTES DE LIMPIEZA
-- ============================================
-- Este query muestra un resumen de TODOS los datos
-- que serán eliminados si ejecutas la limpieza
--
-- Ejecutar ANTES de limpiar para saber qué perderás
-- ============================================

-- ============================================
-- 1. RESUMEN DE REGISTROS POR TABLA
-- ============================================

SELECT
  '📊 RESUMEN GENERAL' as seccion,
  '' as tabla,
  '' as registros,
  '' as detalles
UNION ALL
SELECT
  '=' as seccion,
  '=' as tabla,
  '=' as registros,
  '=' as detalles

UNION ALL
SELECT
  '1️⃣' as seccion,
  'proyectos' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Proyectos de construcción' as detalles
FROM proyectos

UNION ALL
SELECT
  '2️⃣' as seccion,
  'manzanas' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Manzanas en proyectos' as detalles
FROM manzanas

UNION ALL
SELECT
  '3️⃣' as seccion,
  'viviendas' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Viviendas en manzanas' as detalles
FROM viviendas

UNION ALL
SELECT
  '4️⃣' as seccion,
  'clientes' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Clientes registrados' as detalles
FROM clientes

UNION ALL
SELECT
  '5️⃣' as seccion,
  'negociaciones' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Negociaciones activas' as detalles
FROM negociaciones

UNION ALL
SELECT
  '6️⃣' as seccion,
  'abonos' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Abonos registrados' as detalles
FROM abonos

UNION ALL
SELECT
  '7️⃣' as seccion,
  'renuncias' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Renuncias procesadas' as detalles
FROM renuncias

UNION ALL
SELECT
  '8️⃣' as seccion,
  'documentos' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Documentos subidos' as detalles
FROM documentos

UNION ALL
SELECT
  '9️⃣' as seccion,
  'categorias_documentos' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Categorías de documentos' as detalles
FROM categorias_documentos

UNION ALL
SELECT
  '🔟' as seccion,
  'usuarios' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  '⚠️ NO se eliminan' as detalles
FROM usuarios

UNION ALL
SELECT
  '1️⃣1️⃣' as seccion,
  'auditoria_acciones' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Acciones auditadas' as detalles
FROM auditoria_acciones

UNION ALL
SELECT
  '1️⃣2️⃣' as seccion,
  'auditoria_cambios' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Cambios auditados' as detalles
FROM auditoria_cambios

UNION ALL
SELECT
  '1️⃣3️⃣' as seccion,
  'auditoria_errores' as tabla,
  CAST(COUNT(*) as TEXT) as registros,
  'Errores auditados' as detalles
FROM auditoria_errores;

-- ============================================
-- 2. DETALLE DE PROYECTOS
-- ============================================

SELECT
  '' as separador,
  '' as col1,
  '' as col2,
  '' as col3,
  '' as col4
UNION ALL
SELECT
  '📁 PROYECTOS EXISTENTES' as separador,
  '' as col1,
  '' as col2,
  '' as col3,
  '' as col4
UNION ALL
SELECT
  '=' as separador,
  '=' as col1,
  '=' as col2,
  '=' as col3,
  '=' as col4;

SELECT
  p.nombre as proyecto,
  p.estado as estado,
  COUNT(DISTINCT m.id) as total_manzanas,
  COUNT(DISTINCT v.id) as total_viviendas,
  p.created_at::date as fecha_creacion
FROM proyectos p
LEFT JOIN manzanas m ON m.proyecto_id = p.id
LEFT JOIN viviendas v ON v.manzana_id = m.id
GROUP BY p.id, p.nombre, p.estado, p.created_at
ORDER BY p.created_at DESC;

-- ============================================
-- 3. DETALLE DE CLIENTES
-- ============================================

SELECT
  '' as separador,
  '' as col1,
  '' as col2,
  '' as col3
UNION ALL
SELECT
  '👥 CLIENTES REGISTRADOS' as separador,
  '' as col1,
  '' as col2,
  '' as col3
UNION ALL
SELECT
  '=' as separador,
  '=' as col1,
  '=' as col2,
  '=' as col3;

SELECT
  c.nombres || ' ' || c.apellidos as cliente,
  c.email,
  COUNT(DISTINCT n.id) as negociaciones,
  c.created_at::date as fecha_registro
FROM clientes c
LEFT JOIN negociaciones n ON n.cliente_id = c.id
GROUP BY c.id, c.nombres, c.apellidos, c.email, c.created_at
ORDER BY c.created_at DESC
LIMIT 10;

-- ============================================
-- 4. DETALLE DE DOCUMENTOS
-- ============================================

SELECT
  '' as separador,
  '' as col1,
  '' as col2,
  '' as col3
UNION ALL
SELECT
  '📄 DOCUMENTOS ALMACENADOS' as separador,
  '' as col1,
  '' as col2,
  '' as col3
UNION ALL
SELECT
  '=' as separador,
  '=' as col1,
  '=' as col2,
  '=' as col3;

SELECT
  cat.nombre as categoria,
  COUNT(d.id) as cantidad_documentos,
  ROUND(SUM(d.tamano)::numeric / 1048576, 2) as tamano_total_mb,
  MAX(d.created_at)::date as ultimo_documento
FROM categorias_documentos cat
LEFT JOIN documentos d ON d.categoria_id = cat.id
GROUP BY cat.id, cat.nombre
ORDER BY cantidad_documentos DESC;

-- ============================================
-- 5. DETALLE DE AUDITORÍA
-- ============================================

SELECT
  '' as separador,
  '' as col1,
  '' as col2
UNION ALL
SELECT
  '🔍 AUDITORÍA' as separador,
  '' as col1,
  '' as col2
UNION ALL
SELECT
  '=' as separador,
  '=' as col1,
  '=' as col2;

SELECT
  'Acciones auditadas' as tipo,
  COUNT(*) as cantidad,
  MAX(created_at)::date as ultima_entrada
FROM auditoria_acciones
UNION ALL
SELECT
  'Cambios registrados' as tipo,
  COUNT(*) as cantidad,
  MAX(created_at)::date as ultima_entrada
FROM auditoria_cambios
UNION ALL
SELECT
  'Errores capturados' as tipo,
  COUNT(*) as cantidad,
  MAX(created_at)::date as ultima_entrada
FROM auditoria_errores;

-- ============================================
-- 6. ADVERTENCIA FINAL
-- ============================================

SELECT
  '' as separador,
  '' as col1
UNION ALL
SELECT
  '⚠️ ADVERTENCIA' as separador,
  '' as col1
UNION ALL
SELECT
  '=' as separador,
  '=' as col1
UNION ALL
SELECT
  '❌' as separador,
  'Si ejecutas la limpieza, TODOS estos datos serán ELIMINADOS' as col1
UNION ALL
SELECT
  '❌' as separador,
  'Esta acción es IRREVERSIBLE' as col1
UNION ALL
SELECT
  '✅' as separador,
  'La estructura de las tablas se mantendrá intacta' as col1
UNION ALL
SELECT
  '✅' as separador,
  'Los usuarios NO serán eliminados' as col1;

-- ============================================
-- FIN DE VERIFICACIÓN
-- ============================================
