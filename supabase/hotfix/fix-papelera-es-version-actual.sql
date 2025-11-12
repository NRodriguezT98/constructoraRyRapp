-- =====================================================
-- HOTFIX: Corregir flag es_version_actual en Papelera
-- =====================================================
-- Problema: Documentos eliminados con versión actual=false no aparecen
-- Solución: Marcar la versión más alta como actual

-- 1. Para cada documento_padre en estado eliminado,
--    marcar la versión más alta como actual

WITH versiones_eliminadas AS (
  SELECT
    COALESCE(documento_padre_id, id) as padre_id,
    MAX(version) as version_maxima
  FROM documentos_proyecto
  WHERE estado = 'eliminado'
  GROUP BY COALESCE(documento_padre_id, id)
),
documentos_a_actualizar AS (
  SELECT dp.id
  FROM documentos_proyecto dp
  INNER JOIN versiones_eliminadas ve
    ON COALESCE(dp.documento_padre_id, dp.id) = ve.padre_id
    AND dp.version = ve.version_maxima
  WHERE dp.estado = 'eliminado'
)
UPDATE documentos_proyecto
SET es_version_actual = true
WHERE id IN (SELECT id FROM documentos_a_actualizar);

-- Verificar resultados
SELECT
  id,
  titulo,
  version,
  es_version_actual,
  estado,
  COALESCE(documento_padre_id, id) as padre_id
FROM documentos_proyecto
WHERE estado = 'eliminado'
ORDER BY COALESCE(documento_padre_id, id), version;
