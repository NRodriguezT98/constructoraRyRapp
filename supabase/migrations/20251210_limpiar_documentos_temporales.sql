-- ============================================
-- LIMPIEZA DE DOCUMENTOS TEMPORALES
-- ============================================
-- Fecha: 2025-12-10
-- Descripción: Elimina documentos con etiqueta "Temporal"
--              que quedaron huérfanos por pasos no completados
--
-- SEGURIDAD: Los documentos con etiqueta "Temporal" son
--            aquellos subidos en el proceso pero nunca completados

-- 1. Listar documentos temporales antes de eliminar (para auditoría)
DO $$
DECLARE
  doc_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO doc_count
  FROM documentos_cliente
  WHERE 'Temporal' = ANY(etiquetas);

  RAISE NOTICE '📋 Documentos temporales encontrados: %', doc_count;
END $$;

-- 2. Eliminar documentos temporales de la base de datos
-- Nota: Los archivos en Storage deben eliminarse manualmente o con script aparte
DELETE FROM documentos_cliente
WHERE 'Temporal' = ANY(etiquetas);

-- 3. Confirmación
DO $$
DECLARE
  doc_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO doc_count
  FROM documentos_cliente
  WHERE 'Temporal' = ANY(etiquetas);

  IF doc_count = 0 THEN
    RAISE NOTICE '✅ Todos los documentos temporales fueron eliminados';
  ELSE
    RAISE WARNING '⚠️ Aún quedan % documentos temporales', doc_count;
  END IF;
END $$;
