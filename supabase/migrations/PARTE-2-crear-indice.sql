-- ============================================
-- PARTE 2: Crear índice (ejecutar después de PARTE 1)
-- ============================================
CREATE INDEX idx_documentos_cliente_es_identidad
ON documentos_cliente(cliente_id, es_documento_identidad, estado)
WHERE es_documento_identidad = TRUE;

-- Verificar
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'documentos_cliente'
AND indexname = 'idx_documentos_cliente_es_identidad';

-- Si ves el índice, ✅ funcionó
