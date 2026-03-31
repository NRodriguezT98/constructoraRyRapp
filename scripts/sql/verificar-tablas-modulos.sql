-- ============================================
-- VERIFICACIÓN: ¿Cada módulo usa su tabla correcta?
-- ============================================

-- 1️⃣ DOCUMENTOS DE PROYECTOS
SELECT
  '📁 PROYECTOS' as modulo,
  'documentos_proyecto' as tabla_esperada,
  COUNT(*) as total_documentos,
  COUNT(DISTINCT proyecto_id) as proyectos_unicos,
  MAX(fecha_creacion::date) as ultimo_documento
FROM documentos_proyecto;

-- 2️⃣ DOCUMENTOS DE VIVIENDAS
SELECT
  '🏠 VIVIENDAS' as modulo,
  'documentos_vivienda' as tabla_esperada,
  COUNT(*) as total_documentos,
  COUNT(DISTINCT vivienda_id) as viviendas_unicas,
  MAX(fecha_creacion::date) as ultimo_documento
FROM documentos_vivienda;

-- 3️⃣ DOCUMENTOS DE CLIENTES
SELECT
  '👤 CLIENTES' as modulo,
  'documentos_cliente' as tabla_esperada,
  COUNT(*) as total_documentos,
  COUNT(DISTINCT cliente_id) as clientes_unicos,
  MAX(fecha_creacion::date) as ultimo_documento
FROM documentos_cliente;

-- 4️⃣ VERIFICAR BUCKETS DE STORAGE
SELECT
  '🪣 STORAGE BUCKETS' as tipo,
  name as bucket_name,
  CASE
    WHEN name = 'documentos-proyectos' THEN '✅ Proyectos OK'
    WHEN name = 'documentos-viviendas' THEN '✅ Viviendas OK'
    WHEN name = 'documentos-clientes' THEN '✅ Clientes OK'
    ELSE '⚠️ Bucket desconocido'
  END as verificacion,
  created_at::date as fecha_creacion
FROM storage.buckets
WHERE name LIKE 'documentos-%'
ORDER BY name;
