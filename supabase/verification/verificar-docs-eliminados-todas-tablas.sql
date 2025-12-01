-- Verificar documentos eliminados en las 3 tablas

-- 1. Documentos de CLIENTES eliminados
SELECT
  'CLIENTES' as tabla,
  COUNT(*) as total_eliminados
FROM documentos_cliente
WHERE estado = 'Eliminado'
  AND es_version_actual = true;

-- 2. Documentos de PROYECTOS eliminados
SELECT
  'PROYECTOS' as tabla,
  COUNT(*) as total_eliminados
FROM documentos_proyecto
WHERE estado = 'Eliminado'
  AND es_version_actual = true;

-- 3. Documentos de VIVIENDAS eliminados
SELECT
  'VIVIENDAS' as tabla,
  COUNT(*) as total_eliminados
FROM documentos_vivienda
WHERE estado = 'Eliminado'
  AND es_version_actual = true;

-- 4. Detalles de documentos eliminados de CLIENTES (si existen)
SELECT
  id,
  titulo,
  estado,
  es_version_actual,
  subido_por,
  fecha_actualizacion
FROM documentos_cliente
WHERE estado = 'Eliminado'
  AND es_version_actual = true
LIMIT 5;
