-- ============================================
-- MIGRACIÓN: Agregar campo es_documento_identidad
-- ============================================
-- Permite marcar documentos como documentos de identidad (cédula, pasaporte, etc.)
-- para validaciones de negociación

-- 1. Agregar campo es_documento_identidad a documentos_cliente
ALTER TABLE documentos_cliente
ADD COLUMN IF NOT EXISTS es_documento_identidad BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_documentos_cliente_es_identidad
ON documentos_cliente(cliente_id, es_documento_identidad, estado)
WHERE es_documento_identidad = TRUE;

-- 3. Comentarios
COMMENT ON COLUMN documentos_cliente.es_documento_identidad IS
'Indica si el documento es de identidad (cédula, pasaporte, RUT, etc.). Se usa para validar que el cliente puede iniciar negociaciones.';

-- 4. Migrar datos existentes: Marcar cédulas actuales
DO $$
DECLARE
  cliente_record RECORD;
  categoria_identidad_id UUID;
  storage_path TEXT;
  usuario_sistema UUID;
BEGIN
  -- Obtener un usuario del sistema para asignar
  SELECT id INTO usuario_sistema FROM auth.users LIMIT 1;

  -- Buscar categoría "Documentos de Identidad" (debe existir ya)
  SELECT id INTO categoria_identidad_id
  FROM categorias_documento
  WHERE nombre = 'Documentos de Identidad'
  LIMIT 1;

  -- Si no existe, crearla
  IF categoria_identidad_id IS NULL THEN
    INSERT INTO categorias_documento (
      user_id,
      nombre,
      color,
      icono,
      descripcion,
      modulos_permitidos,
      es_global
    )
    VALUES (
      usuario_sistema,
      'Documentos de Identidad',
      '#EF4444',
      'IdCard',
      'Cédulas, pasaportes y documentos de identificación oficial',
      ARRAY['clientes']::TEXT[],
      TRUE
    )
    RETURNING id INTO categoria_identidad_id;
  END IF;

  -- Migrar cédulas existentes desde clientes.documento_identidad_url
  FOR cliente_record IN
    SELECT id, documento_identidad_url, nombres, apellidos, numero_documento
    FROM clientes
    WHERE documento_identidad_url IS NOT NULL
      AND documento_identidad_url != ''
  LOOP
    -- Extraer path del storage desde la URL
    storage_path := SUBSTRING(cliente_record.documento_identidad_url FROM 'documentos-clientes/(.+)$');

    IF storage_path IS NOT NULL AND storage_path != '' THEN
      -- Verificar que no exista ya un documento de identidad para este cliente
      IF NOT EXISTS (
        SELECT 1 FROM documentos_cliente
        WHERE cliente_id = cliente_record.id
        AND es_documento_identidad = TRUE
      ) THEN
        -- Crear registro de documento
        INSERT INTO documentos_cliente (
          cliente_id,
          categoria_id,
          titulo,
          descripcion,
          nombre_archivo,
          nombre_original,
          tamano_bytes,
          tipo_mime,
          url_storage,
          subido_por,
          es_importante,
          es_documento_identidad,
          version,
          es_version_actual,
          estado
        )
        VALUES (
          cliente_record.id,
          categoria_identidad_id,
          'Cédula de Ciudadanía - ' || COALESCE(cliente_record.numero_documento, ''),
          'Documento de identidad del cliente ' || cliente_record.nombres || ' ' || cliente_record.apellidos,
          SUBSTRING(storage_path FROM '[^/]+$'), -- Nombre del archivo
          SUBSTRING(storage_path FROM '[^/]+$'),
          0, -- Tamaño desconocido
          'application/pdf',
          storage_path,
          usuario_sistema,
          TRUE, -- Siempre importante
          TRUE, -- Es documento de identidad
          1,
          TRUE,
          'Activo'
        );

        RAISE NOTICE 'Migrada cédula para cliente: % % (ID: %)',
          cliente_record.nombres, cliente_record.apellidos, cliente_record.id;
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migración completada exitosamente';
END $$;
