-- Script para verificar si area_lote está guardando con precisión
-- Ejecutar en Supabase SQL Editor y copiar resultado aquí

SELECT
    numero,
    area_lote,
    CAST(area_lote AS TEXT) as area_lote_texto,
    pg_typeof(area_lote) as tipo_dato
FROM viviendas
WHERE area_lote = 66.125  -- Buscar el valor específico
   OR area_lote = 66.13   -- O el valor aproximado
ORDER BY fecha_creacion DESC;
