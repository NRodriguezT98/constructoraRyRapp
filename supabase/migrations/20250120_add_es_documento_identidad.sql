-- ============================================
-- MIGRACIÓN: Agregar campo es_documento_identidad
-- ============================================
-- Permite marcar documentos como documentos de identidad (cédula, pasaporte, etc.)
-- para validaciones de negociación
--
-- ⚠️ ESTADO: PENDIENTE DE EJECUCIÓN
-- Fecha: 20 Enero 2025
-- Razón: Problemas de conexión con Supabase
-- Documentación: PENDIENTE-VALIDACION-CEDULA.md
--
-- IMPORTANTE: Ejecutar este script ANTES de producción

-- 1. Agregar campo es_documento_identidad a documentos_cliente
ALTER TABLE documentos_cliente
ADD COLUMN es_documento_identidad BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX idx_documentos_cliente_es_identidad
ON documentos_cliente(cliente_id, es_documento_identidad, estado)
WHERE es_documento_identidad = TRUE;

-- 3. Comentarios
COMMENT ON COLUMN documentos_cliente.es_documento_identidad IS
'Indica si el documento es de identidad (cédula, pasaporte, RUT, etc.). Se usa para validar que el cliente puede iniciar negociaciones.';

-- 4. Migrar datos existentes: Marcar cédulas actuales
-- Si el cliente tiene documento_identidad_url, crear registro en documentos_cliente
DO $$
DECLARE
  cliente_record RECORD;
  nueva_categoria_id UUID;
  storage_path TEXT;
BEGIN
  -- Buscar o crear categoría "Documentos de Identidad"
  INSERT INTO categorias_documento (nombre, color, icono, descripcion, modulo, usuario_creacion)
  VALUES (
    'Documentos de Identidad',
    '#EF4444', -- Rojo
    'IdCard',
    'Cédulas, pasaportes y documentos de identificación oficial',
    'clientes',
    (SELECT id FROM auth.users LIMIT 1) -- Usuario del sistema
  )
  ON CONFLICT (nombre, modulo) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id INTO nueva_categoria_id;

  -- Migrar cédulas existentes
  FOR cliente_record IN
    SELECT id, documento_identidad_url, nombres, apellidos, numero_documento
    FROM clientes
    WHERE documento_identidad_url IS NOT NULL
  LOOP
    -- Extraer path del storage
    storage_path := SUBSTRING(cliente_record.documento_identidad_url FROM 'documentos-clientes/(.+)$');

    IF storage_path IS NOT NULL THEN
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
        nueva_categoria_id,
        'Cédula de Ciudadanía - ' || cliente_record.numero_documento,
        'Documento de identidad del cliente ' || cliente_record.nombres || ' ' || cliente_record.apellidos,
        SUBSTRING(storage_path FROM '[^/]+$'), -- Nombre del archivo
        'cedula.pdf',
        0, -- No sabemos el tamaño
        'application/pdf',
        storage_path,
        (SELECT id FROM auth.users LIMIT 1),
        TRUE, -- Importante
        TRUE, -- Es documento de identidad
        1,
        TRUE,
        'activo'
      )
      ON CONFLICT DO NOTHING; -- Evitar duplicados si se ejecuta múltiples veces

      RAISE NOTICE 'Migrada cédula para cliente %: %', cliente_record.id, cliente_record.nombres;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migración completada. Cédulas convertidas a documentos.';
END $$;

-- 5. Crear vista helper para validación de negociaciones
CREATE OR REPLACE VIEW v_clientes_con_cedula AS
SELECT
  c.id AS cliente_id,
  c.nombres,
  c.apellidos,
  c.numero_documento,
  COUNT(dc.id) > 0 AS tiene_cedula,
  MAX(dc.fecha_creacion) AS fecha_ultima_cedula
FROM clientes c
LEFT JOIN documentos_cliente dc ON dc.cliente_id = c.id
  AND dc.es_documento_identidad = TRUE
  AND dc.estado = 'activo'
  AND dc.es_version_actual = TRUE
GROUP BY c.id, c.nombres, c.apellidos, c.numero_documento;

COMMENT ON VIEW v_clientes_con_cedula IS
'Vista helper para verificar rápidamente qué clientes tienen cédula activa cargada';

-- 6. Función helper para validar si cliente puede crear negociación
CREATE OR REPLACE FUNCTION puede_crear_negociacion(p_cliente_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tiene_cedula BOOLEAN;
BEGIN
  -- Verificar si tiene al menos un documento de identidad activo
  SELECT EXISTS (
    SELECT 1
    FROM documentos_cliente
    WHERE cliente_id = p_cliente_id
      AND es_documento_identidad = TRUE
      AND estado = 'activo'
      AND es_version_actual = TRUE
  ) INTO tiene_cedula;

  RETURN tiene_cedula;
END;
$$;

COMMENT ON FUNCTION puede_crear_negociacion IS
'Valida si un cliente puede iniciar una negociación verificando que tenga documento de identidad activo';

-- 7. Ejemplo de uso
-- SELECT puede_crear_negociacion('uuid-del-cliente'); -- Returns true/false
