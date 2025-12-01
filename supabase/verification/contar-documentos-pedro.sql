SELECT
    'TEST' as tipo,
    COUNT(*) as total_documentos,
    COUNT(*) FILTER (WHERE estado = 'Activo') as con_estado_activo,
    COUNT(*) FILTER (WHERE es_version_actual = true) as con_version_actual,
    COUNT(*) FILTER (WHERE estado = 'Activo' AND es_version_actual = true) as con_ambos_filtros
FROM documentos_cliente
WHERE cliente_id = 'af1b4e40-2fa0-4a62-8d95-421737a3c83b';
