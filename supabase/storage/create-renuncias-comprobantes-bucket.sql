-- ====================================================================
-- CREAR / CONFIGURAR BUCKET: renuncias-comprobantes (PRIVADO)
-- ====================================================================
--
-- Cambio: bucket ahora es PRIVADO (public = false).
-- Los comprobantes de devolución son documentos financieros sensibles.
-- El acceso se hace con URLs firmadas (signed URLs) que expiran en 1 hora.
-- El path del archivo se guarda en renuncias.comprobante_devolucion_url.
-- ====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'renuncias-comprobantes',
  'renuncias-comprobantes',
  false,                          -- 🔒 PRIVADO: URLs firmadas con expiración
  10485760,                       -- 10 MB límite por archivo
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public = false,             -- 🔒 Asegurar que sea privado
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
      ];

-- ====================================================================
-- POLÍTICAS RLS para el bucket
-- ====================================================================

-- Leer (SELECT): cualquier usuario autenticado puede ver comprobantes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'renuncias_comprobantes_read'
  ) THEN
    CREATE POLICY "renuncias_comprobantes_read"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'renuncias-comprobantes');
  END IF;
END $$;

-- Subir (INSERT): usuarios autenticados pueden subir
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'renuncias_comprobantes_insert'
  ) THEN
    CREATE POLICY "renuncias_comprobantes_insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'renuncias-comprobantes');
  END IF;
END $$;

-- Actualizar (UPDATE): usuarios autenticados pueden reemplazar
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'renuncias_comprobantes_update'
  ) THEN
    CREATE POLICY "renuncias_comprobantes_update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'renuncias-comprobantes');
  END IF;
END $$;

-- ====================================================================
-- Verificación
-- ====================================================================
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'renuncias-comprobantes';
