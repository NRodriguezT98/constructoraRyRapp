-- ================================================
-- DIAGNÓSTICO: Cliente con Documentos Faltantes
-- ================================================
-- Fecha: 2025-12-01
-- Propósito: Verificar estado de documentos de cliente específico

-- 1. Verificar datos del cliente (incluye cédula)
SELECT
  id,
  nombres,
  apellidos,
  numero_documento,
  tipo_documento,
  documento_identidad_url,
  created_at,
  updated_at
FROM clientes
WHERE nombres ILIKE '%Luis%'
   OR nombres ILIKE '%David%'
   OR numero_documento ILIKE '%1000%'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar documentos en sistema de documentos
SELECT
  d.id,
  d.cliente_id,
  d.titulo,
  d.nombre_archivo,
  d.ruta_storage,
  d.categoria_id,
  cat.nombre as categoria_nombre,
  d.fecha_documento,
  d.es_eliminado,
  d.created_at
FROM documentos_cliente d
LEFT JOIN categorias_documentos_cliente cat ON d.categoria_id = cat.id
WHERE d.cliente_id IN (
  SELECT id FROM clientes
  WHERE nombres ILIKE '%Luis%'
     OR nombres ILIKE '%David%'
     OR numero_documento ILIKE '%1000%'
)
ORDER BY d.created_at DESC;

-- 3. Verificar archivos en Storage (tabla storage.objects)
SELECT
  o.id,
  o.name,
  o.bucket_id,
  o.owner,
  o.created_at,
  o.metadata,
  CONCAT('https://mlxvufgzgrvxdjfknvzi.supabase.co/storage/v1/object/public/', o.bucket_id, '/', o.name) as url_publica
FROM storage.objects o
WHERE o.bucket_id = 'documentos-clientes'
  AND o.name LIKE '%cedula%'
ORDER BY o.created_at DESC
LIMIT 20;

-- 4. Verificar negociaciones del cliente (necesita cédula)
SELECT
  n.id,
  n.cliente_id,
  c.nombres,
  c.apellidos,
  n.estado,
  n.vivienda_id,
  n.created_at
FROM negociaciones n
JOIN clientes c ON n.cliente_id = c.id
WHERE c.nombres ILIKE '%Luis%'
   OR c.nombres ILIKE '%David%'
ORDER BY n.created_at DESC;

-- 5. Verificar audit_log del cliente (cambios recientes)
SELECT
  al.id,
  al.tabla_nombre,
  al.accion,
  al.metadata->>'campo_modificado' as campo_modificado,
  al.datos_nuevos->>'documento_identidad_url' as nueva_cedula_url,
  al.datos_anteriores->>'documento_identidad_url' as anterior_cedula_url,
  al.created_at,
  u.email as usuario_email
FROM audit_log al
LEFT JOIN auth.users u ON al.usuario_id = u.id
WHERE al.tabla_nombre = 'clientes'
  AND al.registro_id IN (
    SELECT id::text FROM clientes
    WHERE nombres ILIKE '%Luis%'
       OR nombres ILIKE '%David%'
  )
ORDER BY al.created_at DESC
LIMIT 10;

-- 6. Verificar Storage files por owner (usuario que subió)
SELECT
  o.name,
  o.owner,
  o.created_at,
  u.email as owner_email,
  o.metadata
FROM storage.objects o
LEFT JOIN auth.users u ON o.owner = u.id
WHERE o.bucket_id = 'documentos-clientes'
  AND o.created_at > NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC
LIMIT 30;

-- 7. RESUMEN: Clientes sin cédula
SELECT
  c.id,
  c.nombres,
  c.apellidos,
  c.numero_documento,
  c.documento_identidad_url,
  CASE
    WHEN c.documento_identidad_url IS NULL THEN 'SIN CÉDULA ⚠️'
    ELSE 'CON CÉDULA ✅'
  END as estado_cedula,
  COUNT(DISTINCT n.id) as negociaciones_count,
  c.created_at
FROM clientes c
LEFT JOIN negociaciones n ON c.id = n.cliente_id
WHERE c.created_at > NOW() - INTERVAL '30 days'
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT 20;
