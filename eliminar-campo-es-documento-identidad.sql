-- ============================================
-- ELIMINAR CAMPO es_documento_identidad
-- ============================================
-- Este campo se creó en una migración que no se debió ejecutar.
-- La cédula se almacena en clientes.documento_identidad_url
-- ============================================

-- 1. Verificar si la columna existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documentos_cliente'
      AND column_name = 'es_documento_identidad'
  ) THEN
    RAISE NOTICE 'La columna es_documento_identidad EXISTE. Procediendo a eliminarla...';

    -- Eliminar el índice si existe
    DROP INDEX IF EXISTS idx_documentos_cliente_cedula;

    -- Eliminar la columna
    ALTER TABLE documentos_cliente
    DROP COLUMN es_documento_identidad;

    RAISE NOTICE 'Columna eliminada exitosamente.';
  ELSE
    RAISE NOTICE 'La columna es_documento_identidad NO EXISTE. No hay nada que eliminar.';
  END IF;
END $$;

-- 2. Recargar el esquema de PostgREST (forzar recarga del caché)
NOTIFY pgrst, 'reload schema';

-- 3. Verificar que se eliminó correctamente
SELECT
  column_name,
  data_type
FROM
  information_schema.columns
WHERE
  table_schema = 'public'
  AND table_name = 'documentos_cliente'
ORDER BY
  ordinal_position;
