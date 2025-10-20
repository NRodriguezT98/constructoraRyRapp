-- =====================================================
-- MIGRACIÓN SEGURA: Tabla clientes
-- Verifica qué existe antes de migrar
-- =====================================================

-- PASO 1: Verificar qué tabla existe actualmente
DO $$
BEGIN
    -- Si existe clientes_old pero no clientes nueva, renombrar de vuelta
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clientes_old')
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'nombres')
    THEN
        ALTER TABLE public.clientes_old RENAME TO clientes;
        RAISE NOTICE '✅ Tabla clientes_old renombrada a clientes';
    END IF;

    -- Si existe clientes con estructura antigua, renombrar a clientes_old
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'nombre')
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'nombres')
    THEN
        ALTER TABLE public.clientes RENAME TO clientes_old;
        RAISE NOTICE '✅ Tabla clientes antigua renombrada a clientes_old';
    END IF;
END $$;

-- PASO 2: Crear nueva tabla clientes solo si no existe con estructura nueva
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información Personal
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  nombre_completo VARCHAR(200) GENERATED ALWAYS AS (nombres || ' ' || apellidos) STORED,

  tipo_documento VARCHAR(10) CHECK (tipo_documento IN ('CC', 'CE', 'TI', 'NIT', 'PP', 'PEP')) NOT NULL DEFAULT 'CC',
  numero_documento VARCHAR(20) NOT NULL,
  fecha_nacimiento DATE,

  -- Contacto
  telefono VARCHAR(20),
  telefono_alternativo VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  ciudad VARCHAR(100) DEFAULT 'Cali',
  departamento VARCHAR(100) DEFAULT 'Valle del Cauca',

  -- Estado del Cliente
  estado VARCHAR(20) CHECK (estado IN ('Interesado', 'Activo', 'Inactivo')) DEFAULT 'Interesado' NOT NULL,

  -- Origen/Fuente
  origen VARCHAR(50) CHECK (origen IN (
    'Referido',
    'Página Web',
    'Redes Sociales',
    'Llamada Directa',
    'Visita Oficina',
    'Feria/Evento',
    'Publicidad',
    'Otro'
  )),
  referido_por VARCHAR(200),

  -- Documentos
  documento_identidad_url TEXT,

  -- Notas
  notas TEXT,

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_creacion UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT clientes_documento_unico UNIQUE(tipo_documento, numero_documento)
);

-- PASO 3: Migrar datos solo si existe clientes_old y clientes nueva está vacía
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clientes_old')
       AND (SELECT COUNT(*) FROM public.clientes) = 0
    THEN
        INSERT INTO public.clientes (
          id,
          nombres,
          apellidos,
          tipo_documento,
          numero_documento,
          email,
          telefono,
          direccion,
          estado,
          fecha_creacion,
          fecha_actualizacion
        )
        SELECT
          id,
          COALESCE(nombre, 'Sin Nombre') as nombres,
          COALESCE(apellido, 'Sin Apellido') as apellidos,
          COALESCE(documento_tipo, 'CC') as tipo_documento,
          COALESCE(documento_numero, 'SIN-DOC') as numero_documento,
          email,
          telefono,
          direccion,
          'Activo' as estado,
          COALESCE(fecha_creacion, NOW()),
          COALESCE(fecha_actualizacion, NOW())
        FROM clientes_old;

        RAISE NOTICE '✅ Datos migrados desde clientes_old';
    ELSE
        RAISE NOTICE '⚠️  No se requiere migración de datos';
    END IF;
END $$;

-- PASO 4: Recrear índices
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON public.clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_numero_documento ON public.clientes(numero_documento);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_completo ON public.clientes(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_clientes_fecha_creacion ON public.clientes(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);

-- PASO 5: Verificación
DO $$
DECLARE
    v_count_new INTEGER;
    v_count_old INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count_new FROM public.clientes;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clientes_old') THEN
        SELECT COUNT(*) INTO v_count_old FROM clientes_old;
        RAISE NOTICE '✅ Clientes nuevos: %, Clientes antiguos: %', v_count_new, v_count_old;
    ELSE
        RAISE NOTICE '✅ Clientes en tabla nueva: %', v_count_new;
    END IF;
END $$;

COMMENT ON TABLE public.clientes IS 'Clientes del sistema - pueden existir sin vivienda asignada (migrado)';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Tabla clientes con estructura nueva
-- ✅ Datos migrados (si existía clientes_old)
-- ✅ Índices creados
-- ✅ Sin errores

-- =====================================================
-- VERIFICAR RESULTADO:
-- =====================================================
-- Ver estructura:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clientes' ORDER BY ordinal_position;

-- Ver datos:
-- SELECT id, nombre_completo, estado, origen FROM clientes LIMIT 5;

-- Eliminar tabla antigua (SOLO si todo está OK):
-- DROP TABLE IF EXISTS clientes_old CASCADE;
