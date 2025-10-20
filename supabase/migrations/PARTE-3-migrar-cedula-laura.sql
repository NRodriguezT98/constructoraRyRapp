-- ============================================
-- PARTE 3: Migrar cédula de Laura (ejecutar después de PARTE 2)
-- ============================================

-- Primero, verificar datos actuales de Laura
SELECT id, nombres, apellidos, documento_identidad_url
FROM clientes
WHERE nombres ILIKE '%laura%';

-- Copiar el ID de Laura del resultado anterior y usarlo abajo
-- Reemplaza 'UUID-DE-LAURA' con el ID real

DO $$
DECLARE
  v_cliente_id UUID := 'UUID-DE-LAURA'; -- ⚠️ REEMPLAZAR CON ID REAL
  v_categoria_id UUID;
  v_storage_path TEXT;
  v_cliente RECORD;
BEGIN
  -- Buscar o crear categoría "Documentos de Identidad"
  INSERT INTO categorias_documento (nombre, color, icono, descripcion, modulo, usuario_creacion)
  VALUES (
    'Documentos de Identidad',
    '#EF4444',
    'IdCard',
    'Cédulas, pasaportes y documentos de identificación oficial',
    'clientes',
    (SELECT id FROM auth.users LIMIT 1)
  )
  ON CONFLICT (nombre, modulo) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id INTO v_categoria_id;

  RAISE NOTICE 'Categoría ID: %', v_categoria_id;

  -- Obtener datos del cliente
  SELECT * INTO v_cliente FROM clientes WHERE id = v_cliente_id;

  IF v_cliente.documento_identidad_url IS NULL THEN
    RAISE NOTICE 'Cliente no tiene cédula cargada';
    RETURN;
  END IF;

  -- Extraer path del storage
  v_storage_path := SUBSTRING(v_cliente.documento_identidad_url FROM 'documentos-clientes/(.+)$');

  RAISE NOTICE 'Storage path: %', v_storage_path;

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
    v_cliente.id,
    v_categoria_id,
    'Cédula de Ciudadanía - ' || v_cliente.numero_documento,
    'Documento de identidad de ' || v_cliente.nombres || ' ' || v_cliente.apellidos,
    SUBSTRING(v_storage_path FROM '[^/]+$'),
    'cedula.pdf',
    0,
    'application/pdf',
    v_storage_path,
    (SELECT id FROM auth.users LIMIT 1),
    TRUE,
    TRUE,
    1,
    TRUE,
    'activo'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Cédula migrada exitosamente para: % %', v_cliente.nombres, v_cliente.apellidos;
END $$;

-- Verificar que se creó
SELECT
  dc.titulo,
  dc.es_documento_identidad,
  dc.es_importante,
  c.nombres,
  c.apellidos
FROM documentos_cliente dc
INNER JOIN clientes c ON c.id = dc.cliente_id
WHERE dc.es_documento_identidad = TRUE;
