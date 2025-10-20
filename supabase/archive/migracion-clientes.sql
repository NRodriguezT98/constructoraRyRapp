-- =====================================================
-- MIGRACIÓN: Tabla clientes antigua → nueva estructura
-- Preserva datos existentes y añade nuevas columnas
-- =====================================================

-- PASO 1: Renombrar tabla antigua temporalmente
ALTER TABLE IF EXISTS public.clientes RENAME TO clientes_old;

-- PASO 2: Crear nueva tabla clientes con estructura completa
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

  -- Origen/Fuente (¿Cómo llegó el cliente?)
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

  -- Notas y Observaciones
  notas TEXT,

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_creacion UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT clientes_documento_unico UNIQUE(tipo_documento, numero_documento)
);

-- PASO 3: Migrar datos de tabla antigua a nueva
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
  nombre as nombres,
  apellido as apellidos,
  documento_tipo as tipo_documento,
  documento_numero as numero_documento,
  email,
  telefono,
  direccion,
  'Activo' as estado, -- Asumimos que clientes existentes son activos
  fecha_creacion,
  fecha_actualizacion
FROM clientes_old;

-- PASO 4: Actualizar referencias en tabla viviendas
-- (La columna cliente_id en viviendas sigue funcionando porque usamos los mismos IDs)

-- PASO 5: Actualizar referencias en tabla abonos
-- (La columna cliente_id en abonos sigue funcionando porque usamos los mismos IDs)

-- PASO 6: Eliminar tabla antigua (comentado por seguridad - descomenta cuando estés seguro)
-- DROP TABLE IF EXISTS clientes_old CASCADE;

-- PASO 7: Recrear índices
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON public.clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_numero_documento ON public.clientes(numero_documento);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_completo ON public.clientes(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_clientes_fecha_creacion ON public.clientes(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);

-- =====================================================
-- Verificación de migración
-- =====================================================
-- Ejecuta esto para verificar que los datos se migraron correctamente:
-- SELECT COUNT(*) as clientes_old FROM clientes_old;
-- SELECT COUNT(*) as clientes_new FROM clientes;
--
-- Si ambos números coinciden, puedes eliminar clientes_old con:
-- DROP TABLE clientes_old CASCADE;

COMMENT ON TABLE public.clientes IS 'Clientes del sistema - pueden existir sin vivienda asignada (migrado)';
