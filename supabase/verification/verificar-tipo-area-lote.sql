-- Verificar tipo de columna area_lote en viviendas
SELECT
    column_name,
    data_type,
    numeric_precision,
    numeric_scale,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'viviendas'
  AND column_name IN ('area_lote', 'area_construida')
ORDER BY column_name;

-- Verificar valores actuales (para ver si hay aproximación)
SELECT
    id,
    numero,
    area_lote,
    area_construida,
    pg_typeof(area_lote) as tipo_area_lote
FROM viviendas
WHERE area_lote IS NOT NULL
ORDER BY fecha_creacion DESC
LIMIT 5;
