-- FIX: Normalizar estados a minúscula en TODAS las tablas de documentos
-- Razón: documentos_proyecto/vivienda tienen CHECK constraint que SOLO acepta minúscula
-- Documentos_cliente no tiene constraint, pero debe ser consistente

-- 1. Documentos_cliente (sin constraint, pero estandarizar)
UPDATE documentos_cliente
SET estado = LOWER(estado)
WHERE estado != LOWER(estado);

-- Verificar resultados
SELECT 'documentos_cliente' as tabla, estado, COUNT(*) as cantidad
FROM documentos_cliente
GROUP BY estado
ORDER BY cantidad DESC;
