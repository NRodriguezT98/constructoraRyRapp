-- ============================================
-- MIGRACIÓN MANUAL: Cédula de Pedro Pérez
-- ============================================

DO $$
DECLARE
  v_cliente_id UUID;
  v_categoria_id UUID;
  v_usuario_id UUID;
  v_url_cedula TEXT;
  v_storage_path TEXT;
BEGIN
  -- 1. Obtener datos de Pedro
  SELECT id, documento_identidad_url INTO v_cliente_id, v_url_cedula
  FROM clientes
  WHERE numero_documento = '12345678';

  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró cliente con número de documento 12345678';
  END IF;

  RAISE NOTICE 'Cliente encontrado: ID = %, URL = %', v_cliente_id, COALESCE(v_url_cedula, 'NULL');

  -- 2. Verificar si ya tiene documento de identidad
  IF EXISTS (
    SELECT 1 FROM documentos_cliente
    WHERE cliente_id = v_cliente_id
    AND es_documento_identidad = TRUE
  ) THEN
    RAISE NOTICE 'El cliente YA tiene documento de identidad registrado';
    RETURN;
  END IF;

  -- 3. Obtener categoría "Documentos de Identidad"
  SELECT id INTO v_categoria_id
  FROM categorias_documento
  WHERE nombre = 'Documentos de Identidad'
  LIMIT 1;

  IF v_categoria_id IS NULL THEN
    RAISE EXCEPTION 'No existe categoría "Documentos de Identidad"';
  END IF;

  -- 4. Obtener usuario del sistema
  SELECT id INTO v_usuario_id FROM auth.users LIMIT 1;

  -- 5. Extraer storage path si existe URL
  IF v_url_cedula IS NOT NULL AND v_url_cedula != '' THEN
    v_storage_path := SUBSTRING(v_url_cedula FROM 'documentos-clientes/(.+)$');
    RAISE NOTICE 'Storage path extraído: %', v_storage_path;
  ELSE
    RAISE NOTICE 'NO hay URL de cédula, el cliente debe subirla manualmente';
    RETURN;
  END IF;

  -- 6. Crear registro de documento
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
    v_cliente_id,
    v_categoria_id,
    'Cédula de Ciudadanía - 12345678',
    'Documento de identidad del cliente Pedro Perez',
    SUBSTRING(v_storage_path FROM '[^/]+$'),
    SUBSTRING(v_storage_path FROM '[^/]+$'),
    0,
    'application/pdf',
    v_storage_path,
    v_usuario_id,
    TRUE,
    TRUE,
    1,
    TRUE,
    'Activo'
  );

  RAISE NOTICE '✅ Cédula migrada exitosamente para Pedro Pérez';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
    RAISE;
END $$;
