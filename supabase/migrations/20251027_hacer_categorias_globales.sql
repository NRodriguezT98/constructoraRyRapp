-- =====================================================
-- MIGRACIÓN: Hacer categorías globales y compartidas
-- =====================================================
-- Fecha: 2025-10-27
-- Descripción: Convierte las categorías en recurso global compartido entre usuarios

-- =====================================================
-- PASO 1: Marcar todas las categorías existentes como globales
-- =====================================================

UPDATE categorias_documento
SET es_global = true
WHERE nombre IN ('Evidencias', 'Documentos Legales', 'Identidad', 'Documentos de Identidad', 'Financiero', 'Cartas de Aprobación');

-- =====================================================
-- PASO 2: Eliminar duplicados (mantener solo un conjunto de categorías)
-- =====================================================

-- Primero, identificar y mantener solo las categorías del primer usuario
-- y actualizar referencias en documentos_cliente
DO $$
DECLARE
  primer_usuario_id uuid;
  cat_evidencias_id uuid;
  cat_legales_id uuid;
  cat_identidad_id uuid;
  cat_financiero_id uuid;
  cat_aprobacion_id uuid;
BEGIN
  -- Obtener el primer usuario que tenga categorías
  SELECT user_id INTO primer_usuario_id
  FROM categorias_documento
  LIMIT 1;

  -- Obtener IDs de las categorías del primer usuario
  SELECT id INTO cat_evidencias_id FROM categorias_documento
  WHERE user_id = primer_usuario_id AND nombre = 'Evidencias';

  SELECT id INTO cat_legales_id FROM categorias_documento
  WHERE user_id = primer_usuario_id AND nombre = 'Documentos Legales';

  SELECT id INTO cat_identidad_id FROM categorias_documento
  WHERE user_id = primer_usuario_id AND nombre = 'Identidad';

  SELECT id INTO cat_financiero_id FROM categorias_documento
  WHERE user_id = primer_usuario_id AND nombre = 'Financiero';

  SELECT id INTO cat_aprobacion_id FROM categorias_documento
  WHERE user_id = primer_usuario_id AND nombre = 'Cartas de Aprobación';

  -- Actualizar documentos_cliente para usar las categorías del primer usuario
  UPDATE documentos_cliente dc
  SET categoria_id = cat_evidencias_id
  FROM categorias_documento cd
  WHERE dc.categoria_id = cd.id
    AND cd.nombre = 'Evidencias'
    AND cd.user_id != primer_usuario_id;

  UPDATE documentos_cliente dc
  SET categoria_id = cat_legales_id
  FROM categorias_documento cd
  WHERE dc.categoria_id = cd.id
    AND cd.nombre = 'Documentos Legales'
    AND cd.user_id != primer_usuario_id;

  UPDATE documentos_cliente dc
  SET categoria_id = cat_identidad_id
  FROM categorias_documento cd
  WHERE dc.categoria_id = cd.id
    AND cd.nombre = 'Identidad'
    AND cd.user_id != primer_usuario_id;

  UPDATE documentos_cliente dc
  SET categoria_id = cat_financiero_id
  FROM categorias_documento cd
  WHERE dc.categoria_id = cd.id
    AND cd.nombre = 'Financiero'
    AND cd.user_id != primer_usuario_id;

  UPDATE documentos_cliente dc
  SET categoria_id = cat_aprobacion_id
  FROM categorias_documento cd
  WHERE dc.categoria_id = cd.id
    AND cd.nombre = 'Cartas de Aprobación'
    AND cd.user_id != primer_usuario_id;

  -- Hacer lo mismo para documentos_proyecto
  UPDATE documentos_proyecto dp
  SET categoria_id = cat_evidencias_id
  FROM categorias_documento cd
  WHERE dp.categoria_id = cd.id
    AND cd.nombre = 'Evidencias'
    AND cd.user_id != primer_usuario_id;

  UPDATE documentos_proyecto dp
  SET categoria_id = cat_legales_id
  FROM categorias_documento cd
  WHERE dp.categoria_id = cd.id
    AND cd.nombre = 'Documentos Legales'
    AND cd.user_id != primer_usuario_id;

  UPDATE documentos_proyecto dp
  SET categoria_id = cat_identidad_id
  FROM categorias_documento cd
  WHERE dp.categoria_id = cd.id
    AND cd.nombre = 'Identidad'
    AND cd.user_id != primer_usuario_id;

  UPDATE documentos_proyecto dp
  SET categoria_id = cat_financiero_id
  FROM categorias_documento cd
  WHERE dp.categoria_id = cd.id
    AND cd.nombre = 'Financiero'
    AND cd.user_id != primer_usuario_id;

  UPDATE documentos_proyecto dp
  SET categoria_id = cat_aprobacion_id
  FROM categorias_documento cd
  WHERE dp.categoria_id = cd.id
    AND cd.nombre = 'Cartas de Aprobación'
    AND cd.user_id != primer_usuario_id;

  -- Eliminar categorías duplicadas (mantener solo las del primer usuario)
  DELETE FROM categorias_documento
  WHERE user_id != primer_usuario_id
    AND nombre IN ('Evidencias', 'Documentos Legales', 'Identidad', 'Documentos de Identidad', 'Financiero', 'Cartas de Aprobación');

  RAISE NOTICE 'Categorías duplicadas eliminadas. Se mantuvieron las del usuario: %', primer_usuario_id;
END $$;

-- =====================================================
-- PASO 3: Actualizar políticas RLS para acceso global
-- =====================================================

-- POLÍTICA DE LECTURA: Todos pueden ver todas las categorías globales
DROP POLICY IF EXISTS "Users can view own categories" ON categorias_documento;
CREATE POLICY "Users can view all categories"
  ON categorias_documento FOR SELECT
  USING (
    es_global = true OR auth.uid() = user_id
  );

-- POLÍTICA DE INSERCIÓN: Usuarios autenticados pueden crear categorías
DROP POLICY IF EXISTS "Users can insert own categories" ON categorias_documento;
CREATE POLICY "Authenticated users can create categories"
  ON categorias_documento FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- POLÍTICA DE ACTUALIZACIÓN: Solo el creador o cualquier usuario para categorías globales
DROP POLICY IF EXISTS "Users can update own categories" ON categorias_documento;
CREATE POLICY "Users can update categories"
  ON categorias_documento FOR UPDATE
  USING (
    es_global = true OR auth.uid() = user_id
  );

-- POLÍTICA DE ELIMINACIÓN: Solo el creador puede eliminar
DROP POLICY IF EXISTS "Users can delete own categories" ON categorias_documento;
CREATE POLICY "Users can delete own categories"
  ON categorias_documento FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PASO 4: Crear constraint para evitar duplicados globales
-- =====================================================

-- Eliminar constraint anterior
ALTER TABLE categorias_documento
DROP CONSTRAINT IF EXISTS categorias_documento_user_id_nombre_key;

-- Crear índice único para categorías globales (no permite duplicados de nombre en globales)
CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_globales_nombre
ON categorias_documento (nombre)
WHERE es_global = true;

-- Mantener constraint para categorías personales
CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_personales_user_nombre
ON categorias_documento (user_id, nombre)
WHERE es_global = false;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
  total_categorias integer;
  total_globales integer;
BEGIN
  SELECT COUNT(*) INTO total_categorias FROM categorias_documento;
  SELECT COUNT(*) INTO total_globales FROM categorias_documento WHERE es_global = true;

  RAISE NOTICE '✅ Migración completada';
  RAISE NOTICE '   Total categorías: %', total_categorias;
  RAISE NOTICE '   Categorías globales: %', total_globales;
END $$;
