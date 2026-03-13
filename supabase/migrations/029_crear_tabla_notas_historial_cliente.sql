/**
 * Migración: Crear tabla de notas manuales para historial de clientes
 * Fecha: 2025-12-12
 *
 * Propósito:
 * - Permitir a usuarios agregar notas manuales al historial del cliente
 * - Capturar contexto que eventos automáticos no registran
 * - Integrarse con timeline de eventos existente
 */

-- ==========================================
-- CREAR TABLA: notas_historial_cliente
-- ==========================================

CREATE TABLE IF NOT EXISTS notas_historial_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relación con cliente
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,

    -- Contenido de la nota
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    es_importante BOOLEAN DEFAULT FALSE, -- Marcar notas críticas

    -- Auditoría
    creado_por UUID NOT NULL REFERENCES usuarios(id),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    actualizado_por UUID REFERENCES usuarios(id),
    fecha_actualizacion TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT chk_titulo_longitud CHECK (char_length(titulo) >= 3),
    CONSTRAINT chk_contenido_longitud CHECK (char_length(contenido) >= 10)
);

-- ==========================================
-- ÍNDICES PARA PERFORMANCE
-- ==========================================

CREATE INDEX idx_notas_historial_cliente_id ON notas_historial_cliente(cliente_id);
CREATE INDEX idx_notas_historial_fecha ON notas_historial_cliente(fecha_creacion DESC);
CREATE INDEX idx_notas_historial_importante ON notas_historial_cliente(es_importante) WHERE es_importante = TRUE;
CREATE INDEX idx_notas_historial_creador ON notas_historial_cliente(creado_por);

-- ==========================================
-- COMENTARIOS
-- ==========================================

COMMENT ON TABLE notas_historial_cliente IS 'Notas manuales agregadas al historial del cliente por usuarios';
COMMENT ON COLUMN notas_historial_cliente.titulo IS 'Título breve de la nota (3-200 caracteres)';
COMMENT ON COLUMN notas_historial_cliente.contenido IS 'Contenido detallado de la nota (mínimo 10 caracteres)';
COMMENT ON COLUMN notas_historial_cliente.es_importante IS 'Marca nota como crítica para destacarla visualmente';

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE notas_historial_cliente ENABLE ROW LEVEL SECURITY;

-- Política: SELECT - Todos los usuarios autenticados pueden ver notas
CREATE POLICY "Usuarios pueden ver notas de clientes"
    ON notas_historial_cliente FOR SELECT
    TO authenticated
    USING (true);

-- Política: INSERT - Todos los usuarios autenticados pueden crear notas
CREATE POLICY "Usuarios pueden crear notas"
    ON notas_historial_cliente FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = creado_por);

-- Política: UPDATE - Solo creador o Admin pueden editar
CREATE POLICY "Creador o Admin pueden editar notas"
    ON notas_historial_cliente FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = creado_por
        OR
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND rol = 'Administrador'
        )
    )
    WITH CHECK (
        auth.uid() = actualizado_por
    );

-- Política: DELETE - Solo creador o Admin pueden eliminar
CREATE POLICY "Creador o Admin pueden eliminar notas"
    ON notas_historial_cliente FOR DELETE
    TO authenticated
    USING (
        auth.uid() = creado_por
        OR
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND rol = 'Administrador'
        )
    );

-- ==========================================
-- TRIGGER: Actualizar fecha_actualizacion
-- ==========================================

CREATE OR REPLACE FUNCTION actualizar_fecha_nota_historial()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    NEW.actualizado_por = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_fecha_nota
    BEFORE UPDATE ON notas_historial_cliente
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_nota_historial();

-- ==========================================
-- DATOS DE PRUEBA (OPCIONAL - Comentado)
-- ==========================================

/*
INSERT INTO notas_historial_cliente (cliente_id, titulo, contenido, es_importante, creado_por)
VALUES
    (
        (SELECT id FROM clientes LIMIT 1),
        'Llamada telefónica - Interés en Mz. A',
        'Cliente llamó para preguntar por disponibilidad de viviendas en Manzana A. Mostró interés particular en casas de 3 habitaciones.',
        FALSE,
        (SELECT id FROM usuarios WHERE rol = 'Administrador' LIMIT 1)
    );
*/
