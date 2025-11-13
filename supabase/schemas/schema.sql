-- ============================================
-- SCHEMA: RyR Constructora - Sistema de Gestión
-- Descripción: Base de datos para gestión de proyectos de construcción
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: proyectos
-- ============================================
CREATE TABLE IF NOT EXISTS public.proyectos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion VARCHAR(500) NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin_estimada TIMESTAMP WITH TIME ZONE NOT NULL,
    presupuesto NUMERIC(15, 2) NOT NULL DEFAULT 0,
    estado VARCHAR(50) NOT NULL DEFAULT 'en_planificacion' CHECK (estado IN ('en_planificacion', 'en_proceso', 'en_construccion', 'completado', 'pausado')),
    progreso INTEGER NOT NULL DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    responsable VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices para proyectos
CREATE INDEX idx_proyectos_user_id ON public.proyectos(user_id);
CREATE INDEX idx_proyectos_estado ON public.proyectos(estado);
CREATE INDEX idx_proyectos_fecha_inicio ON public.proyectos(fecha_inicio);

-- ============================================
-- TABLA: manzanas
-- ============================================
CREATE TABLE IF NOT EXISTS public.manzanas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    nombre VARCHAR(10) NOT NULL,
    numero_viviendas INTEGER NOT NULL CHECK (numero_viviendas > 0),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para manzanas
CREATE INDEX idx_manzanas_proyecto_id ON public.manzanas(proyecto_id);

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    documento_tipo VARCHAR(50) NOT NULL,
    documento_numero VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    direccion TEXT NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX idx_clientes_documento ON public.clientes(documento_numero);
CREATE INDEX idx_clientes_email ON public.clientes(email);

-- ============================================
-- TABLA: viviendas
-- ============================================
CREATE TABLE IF NOT EXISTS public.viviendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manzana_id UUID NOT NULL REFERENCES public.manzanas(id) ON DELETE CASCADE,
    numero VARCHAR(10) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservada', 'vendida')),
    precio NUMERIC(15, 2) NOT NULL,
    area NUMERIC(10, 2) NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para viviendas
CREATE INDEX idx_viviendas_manzana_id ON public.viviendas(manzana_id);
CREATE INDEX idx_viviendas_cliente_id ON public.viviendas(cliente_id);
CREATE INDEX idx_viviendas_estado ON public.viviendas(estado);

-- ============================================
-- TABLA: abonos
-- ============================================
CREATE TABLE IF NOT EXISTS public.abonos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vivienda_id UUID NOT NULL REFERENCES public.viviendas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    monto NUMERIC(15, 2) NOT NULL CHECK (monto > 0),
    fecha_abono TIMESTAMP WITH TIME ZONE NOT NULL,
    metodo_pago VARCHAR(100) NOT NULL,
    comprobante TEXT,
    observaciones TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para abonos
CREATE INDEX idx_abonos_vivienda_id ON public.abonos(vivienda_id);
CREATE INDEX idx_abonos_cliente_id ON public.abonos(cliente_id);
CREATE INDEX idx_abonos_fecha ON public.abonos(fecha_abono);

-- ============================================
-- TABLA: renuncias
-- ============================================
CREATE TABLE IF NOT EXISTS public.renuncias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vivienda_id UUID NOT NULL REFERENCES public.viviendas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    motivo TEXT NOT NULL,
    fecha_renuncia TIMESTAMP WITH TIME ZONE NOT NULL,
    monto_devolucion NUMERIC(15, 2) NOT NULL DEFAULT 0,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para renuncias
CREATE INDEX idx_renuncias_vivienda_id ON public.renuncias(vivienda_id);
CREATE INDEX idx_renuncias_cliente_id ON public.renuncias(cliente_id);
CREATE INDEX idx_renuncias_estado ON public.renuncias(estado);

-- ============================================
-- FUNCIONES: Triggers para actualizar fecha_actualizacion
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualización automática de fecha_actualizacion
CREATE TRIGGER update_proyectos_fecha_actualizacion BEFORE UPDATE ON public.proyectos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_fecha_actualizacion BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_viviendas_fecha_actualizacion BEFORE UPDATE ON public.viviendas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_renuncias_fecha_actualizacion BEFORE UPDATE ON public.renuncias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manzanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viviendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renuncias ENABLE ROW LEVEL SECURITY;

-- Políticas para proyectos
CREATE POLICY "Los usuarios pueden ver sus propios proyectos"
    ON public.proyectos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios proyectos"
    ON public.proyectos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios proyectos"
    ON public.proyectos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios proyectos"
    ON public.proyectos FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para manzanas (heredan permisos del proyecto)
CREATE POLICY "Los usuarios pueden ver manzanas de sus proyectos"
    ON public.manzanas FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.proyectos
        WHERE proyectos.id = manzanas.proyecto_id
        AND proyectos.user_id = auth.uid()
    ));

CREATE POLICY "Los usuarios pueden crear manzanas en sus proyectos"
    ON public.manzanas FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.proyectos
        WHERE proyectos.id = manzanas.proyecto_id
        AND proyectos.user_id = auth.uid()
    ));

CREATE POLICY "Los usuarios pueden actualizar manzanas de sus proyectos"
    ON public.manzanas FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.proyectos
        WHERE proyectos.id = manzanas.proyecto_id
        AND proyectos.user_id = auth.uid()
    ));

CREATE POLICY "Los usuarios pueden eliminar manzanas de sus proyectos"
    ON public.manzanas FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.proyectos
        WHERE proyectos.id = manzanas.proyecto_id
        AND proyectos.user_id = auth.uid()
    ));

-- Políticas para viviendas
CREATE POLICY "Permitir acceso completo a viviendas"
    ON public.viviendas FOR ALL
    USING (true)
    WITH CHECK (true);

-- Políticas para clientes
CREATE POLICY "Permitir acceso completo a clientes"
    ON public.clientes FOR ALL
    USING (true)
    WITH CHECK (true);

-- Políticas para abonos
CREATE POLICY "Permitir acceso completo a abonos"
    ON public.abonos FOR ALL
    USING (true)
    WITH CHECK (true);

-- Políticas para renuncias
CREATE POLICY "Permitir acceso completo a renuncias"
    ON public.renuncias FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- TABLA: categorias_documento
-- Categorías personalizadas por usuario
-- ============================================
CREATE TABLE IF NOT EXISTS public.categorias_documento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT 'blue', -- Para UI: blue, green, red, purple, etc.
    icono VARCHAR(50) DEFAULT 'Folder', -- Nombre del ícono de Lucide
    orden INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, nombre) -- Evitar duplicados por usuario
);

-- Índices para categorías
CREATE INDEX idx_categorias_user_id ON public.categorias_documento(user_id);

-- ============================================
-- TABLA: documentos_proyecto
-- Sistema flexible de documentos
-- ============================================
CREATE TABLE IF NOT EXISTS public.documentos_proyecto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES public.categorias_documento(id) ON DELETE SET NULL,
    titulo VARCHAR(500) NOT NULL, -- Nombre que el usuario le da al documento
    descripcion TEXT,
    nombre_archivo VARCHAR(500) NOT NULL, -- Nombre técnico en storage
    nombre_original VARCHAR(500) NOT NULL, -- Nombre original del archivo subido
    tamano_bytes BIGINT NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    url_storage TEXT NOT NULL, -- Path en Supabase Storage
    etiquetas TEXT[], -- Array de etiquetas personalizadas: ["urgente", "revisar", "aprobado"]
    version INTEGER NOT NULL DEFAULT 1,
    es_version_actual BOOLEAN NOT NULL DEFAULT true,
    documento_padre_id UUID REFERENCES public.documentos_proyecto(id) ON DELETE SET NULL, -- Para versionado
    estado VARCHAR(50) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'archivado', 'eliminado')),
    metadata JSONB, -- Metadata personalizada completamente libre
    subido_por VARCHAR(255) NOT NULL,
    fecha_documento TIMESTAMP WITH TIME ZONE, -- Fecha del documento (no de subida)
    fecha_vencimiento TIMESTAMP WITH TIME ZONE, -- Opcional, solo si aplica
    es_importante BOOLEAN DEFAULT false, -- Marcador de favorito/importante
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para documentos
CREATE INDEX idx_documentos_proyecto_id ON public.documentos_proyecto(proyecto_id);
CREATE INDEX idx_documentos_categoria_id ON public.documentos_proyecto(categoria_id);
CREATE INDEX idx_documentos_estado ON public.documentos_proyecto(estado);
CREATE INDEX idx_documentos_fecha_vencimiento ON public.documentos_proyecto(fecha_vencimiento);
CREATE INDEX idx_documentos_padre_id ON public.documentos_proyecto(documento_padre_id);
CREATE INDEX idx_documentos_etiquetas ON public.documentos_proyecto USING gin(etiquetas); -- Para búsqueda rápida por etiquetas
CREATE INDEX idx_documentos_importante ON public.documentos_proyecto(es_importante);

-- Trigger para actualización de fecha
CREATE TRIGGER update_documentos_fecha_actualizacion
    BEFORE UPDATE ON public.documentos_proyecto
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para categorías
ALTER TABLE public.categorias_documento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias categorías"
    ON public.categorias_documento FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias categorías"
    ON public.categorias_documento FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias categorías"
    ON public.categorias_documento FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias categorías"
    ON public.categorias_documento FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas RLS para documentos (heredan permisos del proyecto)
ALTER TABLE public.documentos_proyecto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver documentos de sus proyectos"
    ON public.documentos_proyecto FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.proyectos
        WHERE proyectos.id = documentos_proyecto.proyecto_id
        AND proyectos.user_id = auth.uid()
    ));

CREATE POLICY "Los usuarios pueden subir documentos a sus proyectos"
    ON public.documentos_proyecto FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.proyectos
        WHERE proyectos.id = documentos_proyecto.proyecto_id
        AND proyectos.user_id = auth.uid()
    ));

CREATE POLICY "Los usuarios pueden actualizar documentos de sus proyectos"
    ON public.documentos_proyecto FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.proyectos
        WHERE proyectos.id = documentos_proyecto.proyecto_id
        AND proyectos.user_id = auth.uid()
    ));

CREATE POLICY "Los usuarios pueden eliminar documentos de sus proyectos"
    ON public.documentos_proyecto FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.proyectos
        WHERE proyectos.id = documentos_proyecto.proyecto_id
        AND proyectos.user_id = auth.uid()
    ));

-- ============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================
COMMENT ON TABLE public.proyectos IS 'Proyectos de construcción';
COMMENT ON TABLE public.manzanas IS 'Manzanas dentro de cada proyecto';
COMMENT ON TABLE public.viviendas IS 'Viviendas dentro de cada manzana';
COMMENT ON TABLE public.clientes IS 'Clientes que compran viviendas';
COMMENT ON TABLE public.abonos IS 'Pagos/abonos realizados por clientes';
COMMENT ON TABLE public.renuncias IS 'Renuncias de clientes a viviendas';
COMMENT ON TABLE public.categorias_documento IS 'Categorías personalizadas de documentos por usuario';
COMMENT ON TABLE public.documentos_proyecto IS 'Documentos asociados a proyectos con organización flexible';
