-- ============================================================================
-- VERIFICAR: Documentos en DB vs archivos en Storage
-- ============================================================================

-- 1. Listar documentos registrados en la base de datos
SELECT
    id,
    vivienda_id,
    titulo,
    nombre_archivo,
    nombre_original,
    url_storage,
    estado,
    fecha_creacion
FROM documentos_vivienda
WHERE estado = 'activo'
ORDER BY fecha_creacion DESC
LIMIT 10;

-- 2. Verificar estructura de paths
SELECT
    vivienda_id,
    count(*) as total_documentos,
    array_agg(DISTINCT substring(nombre_archivo from 1 for 50)) as ejemplos_nombres
FROM documentos_vivienda
WHERE estado = 'activo'
GROUP BY vivienda_id
ORDER BY total_documentos DESC;

-- 3. Ver documentos con problemas potenciales (espacios, caracteres especiales)
SELECT
    id,
    titulo,
    nombre_archivo,
    CASE
        WHEN nombre_archivo ~ '\s' THEN 'Tiene espacios'
        WHEN nombre_archivo ~ '[^\w\-\.]' THEN 'Caracteres especiales'
        ELSE 'OK'
    END as problema_potencial
FROM documentos_vivienda
WHERE estado = 'activo'
  AND (nombre_archivo ~ '\s' OR nombre_archivo ~ '[^\w\-\.]')
LIMIT 20;
