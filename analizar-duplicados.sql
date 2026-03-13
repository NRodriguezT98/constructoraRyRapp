-- ============================================
-- ANÁLISIS DETALLADO: Comparar versiones duplicadas
-- ============================================

WITH versiones_recientes AS (
  SELECT
    version,
    tipo_cambio,
    razon_cambio,
    fecha_cambio,
    campos_modificados,
    datos_nuevos,
    metadata,
    LENGTH(fuentes_pago_snapshot::text) as tamano_snapshot,
    fuentes_pago_snapshot
  FROM negociaciones_historial
  WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
    AND fecha_cambio > NOW() - INTERVAL '1 minute'
  ORDER BY version DESC
)
SELECT
  version,
  tipo_cambio,
  LEFT(razon_cambio, 80) as razon,
  TO_CHAR(fecha_cambio, 'HH24:MI:SS.MS') as hora,
  campos_modificados,
  tamano_snapshot,
  -- Extraer cuántas fuentes tiene el snapshot
  jsonb_array_length(fuentes_pago_snapshot) as fuentes_en_snapshot,
  -- Mostrar metadata si existe
  CASE
    WHEN metadata IS NOT NULL THEN LEFT(metadata::text, 100)
    ELSE 'sin metadata'
  END as metadata_preview
FROM versiones_recientes
ORDER BY version DESC;
