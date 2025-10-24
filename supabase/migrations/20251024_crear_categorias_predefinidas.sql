-- =====================================================
-- CREAR TABLA Y CATEGORÍAS PREDEFINIDAS PARA DOCUMENTOS
-- =====================================================
-- Fecha: 2025-10-24
-- Descripción: Crea la tabla categorias_documento (si no existe) e inserta categorías comunes

-- =====================================================
-- PASO 1: CREAR TABLA categorias_documento
-- =====================================================

CREATE TABLE IF NOT EXISTS public.categorias_documento (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  nombre character varying(100) NOT NULL,
  descripcion text NULL,
  color character varying(20) NULL DEFAULT 'blue'::character varying,
  icono character varying(50) NULL DEFAULT 'Folder'::character varying,
  orden integer NULL DEFAULT 0,
  fecha_creacion timestamp with time zone NULL DEFAULT now(),
  modulos_permitidos text[] NOT NULL DEFAULT '{proyectos}'::text[],
  es_global boolean NOT NULL DEFAULT false,
  CONSTRAINT categorias_documento_pkey PRIMARY KEY (id),
  CONSTRAINT categorias_documento_user_id_nombre_key UNIQUE (user_id, nombre),
  CONSTRAINT categorias_documento_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT check_modulos_permitidos_no_vacio CHECK (
    ((array_length(modulos_permitidos, 1) > 0) OR (es_global = true))
  )
) TABLESPACE pg_default;

-- Índices
CREATE INDEX IF NOT EXISTS idx_categorias_user_id
  ON public.categorias_documento USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_categorias_modulos_permitidos
  ON public.categorias_documento USING gin (modulos_permitidos) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_categorias_es_global
  ON public.categorias_documento USING btree (es_global) TABLESPACE pg_default;

-- =====================================================
-- PASO 2: INSERTAR CATEGORÍAS PREDEFINIDAS
-- =====================================================

-- Insertar categorías predefinidas para cada usuario existente
-- Usamos DO para evitar errores si ya existen
DO $$
DECLARE
  usuario_id uuid;
BEGIN
  -- Iterar sobre todos los usuarios
  FOR usuario_id IN SELECT id FROM auth.users
  LOOP
    -- Insertar categorías (ON CONFLICT previene duplicados)
    INSERT INTO categorias_documento (
      user_id,
      nombre,
      descripcion,
      color,
      icono,
      modulos_permitidos,
      orden
    )
    VALUES
      (
        usuario_id,
        'Evidencias',
        'Capturas de pantalla, correos, confirmaciones',
        '#3B82F6',
        'Camera',
        '{clientes, proyectos}',
        1
      ),
      (
        usuario_id,
        'Documentos Legales',
        'Contratos, promesas, actas, escrituras',
        '#10B981',
        'FileText',
        '{clientes, proyectos}',
        2
      ),
      (
        usuario_id,
        'Identidad',
        'Cédulas, RUT, certificados personales',
        '#F59E0B',
        'IdCard',
        '{clientes}',
        3
      ),
      (
        usuario_id,
        'Financiero',
        'Aprobaciones de crédito, extractos, cartas laborales',
        '#8B5CF6',
        'DollarSign',
        '{clientes}',
        4
      )
    ON CONFLICT (user_id, nombre) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Categorías predefinidas creadas para todos los usuarios';
END $$;

-- =====================================================
-- PASO 3: HABILITAR RLS (Row Level Security)
-- =====================================================

ALTER TABLE categorias_documento ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven sus propias categorías
DROP POLICY IF EXISTS "Users can view own categories" ON categorias_documento;
CREATE POLICY "Users can view own categories"
  ON categorias_documento FOR SELECT
  USING (auth.uid() = user_id OR es_global = true);

-- Política: Los usuarios solo crean sus propias categorías
DROP POLICY IF EXISTS "Users can insert own categories" ON categorias_documento;
CREATE POLICY "Users can insert own categories"
  ON categorias_documento FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo actualizan sus propias categorías
DROP POLICY IF EXISTS "Users can update own categories" ON categorias_documento;
CREATE POLICY "Users can update own categories"
  ON categorias_documento FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo eliminan sus propias categorías
DROP POLICY IF EXISTS "Users can delete own categories" ON categorias_documento;
CREATE POLICY "Users can delete own categories"
  ON categorias_documento FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
  total_categorias integer;
BEGIN
  SELECT COUNT(*) INTO total_categorias FROM categorias_documento;
  RAISE NOTICE '✅ Migración completada. Total categorías: %', total_categorias;
END $$;
