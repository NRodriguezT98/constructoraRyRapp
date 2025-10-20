-- ============================================
-- PARTE 1: Agregar campo (ejecutar primero)
-- ============================================
ALTER TABLE documentos_cliente
ADD COLUMN es_documento_identidad BOOLEAN DEFAULT FALSE NOT NULL;

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documentos_cliente'
AND column_name = 'es_documento_identidad';

-- Si ves una fila con el resultado, ✅ funcionó
