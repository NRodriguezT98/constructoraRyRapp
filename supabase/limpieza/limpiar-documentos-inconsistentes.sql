-- ============================================================================
-- LIMPIEZA: Documentos de Viviendas - Eliminar registros inconsistentes
-- Descripción: Elimina documentos que apuntan a buckets incorrectos
-- Fecha: 2025-01-08
-- ============================================================================

-- 1. Ver documentos inconsistentes ANTES de eliminar
SELECT
  id,
  vivienda_id,
  version,
  nombre_archivo,
  nombre_original,
  url_storage,
  fecha_creacion
FROM documentos_vivienda
WHERE url_storage NOT LIKE '%/documentos-viviendas/%'
ORDER BY fecha_creacion DESC;

-- 2. ELIMINAR documentos inconsistentes (apuntan a otros buckets)
DELETE FROM documentos_vivienda
WHERE url_storage NOT LIKE '%/documentos-viviendas/%';

-- 3. Verificar resultado
SELECT
  COUNT(*) as total_documentos,
  COUNT(DISTINCT vivienda_id) as viviendas_con_documentos
FROM documentos_vivienda;

-- 4. Mostrar documentos restantes agrupados por vivienda
SELECT
  vivienda_id,
  COUNT(*) as total_documentos,
  MAX(version) as version_maxima,
  STRING_AGG(DISTINCT nombre_original, ', ') as archivos
FROM documentos_vivienda
GROUP BY vivienda_id
ORDER BY total_documentos DESC;
