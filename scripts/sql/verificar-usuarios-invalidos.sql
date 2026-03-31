-- Verificar registros con subido_por inválido
SELECT
    dc.id,
    dc.titulo,
    dc.subido_por,
    CASE
        WHEN u.id IS NULL THEN '❌ Usuario NO existe'
        ELSE '✅ Usuario existe'
    END as estado
FROM documentos_cliente dc
LEFT JOIN usuarios u ON dc.subido_por = u.id
WHERE dc.subido_por IS NOT NULL
ORDER BY (u.id IS NULL) DESC, dc.titulo;
