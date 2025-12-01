-- =====================================================
-- MIGRACIÓN: Agregar Foreign Key subido_por → usuarios
-- =====================================================
-- Tabla: documentos_cliente
-- Propósito: Mantener consistencia con documentos_proyecto y documentos_vivienda
-- Fecha: 2025-11-24
-- =====================================================

-- 1. Deshabilitar RLS temporalmente para permitir ALTER TYPE
ALTER TABLE documentos_cliente DISABLE ROW LEVEL SECURITY;

-- 2. Guardar políticas existentes (para recrearlas después)
-- Primero, eliminar políticas que dependen de subido_por
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'documentos_cliente'
    LOOP
        RAISE NOTICE 'Eliminando política: %', policy_record.policyname;
        EXECUTE format('DROP POLICY IF EXISTS %I ON documentos_cliente', policy_record.policyname);
    END LOOP;
END $$;

-- 3. Convertir columna subido_por de TEXT a UUID
DO $$
BEGIN
    -- Verificar si ya es UUID
    IF (SELECT data_type FROM information_schema.columns
        WHERE table_name = 'documentos_cliente' AND column_name = 'subido_por') = 'text' THEN

        RAISE NOTICE '🔄 Convirtiendo subido_por de TEXT a UUID...';

        -- Convertir tipo de dato
        ALTER TABLE documentos_cliente
        ALTER COLUMN subido_por TYPE uuid USING subido_por::uuid;

        RAISE NOTICE '✅ Columna convertida a UUID';
    ELSE
        RAISE NOTICE 'ℹ️  Columna ya es UUID';
    END IF;
END $$;

-- 2. Verificar si la FK ya existe (evitar error si se ejecuta dos veces)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_documentos_cliente_subido_por'
        AND table_name = 'documentos_cliente'
    ) THEN
        -- 3. Agregar Foreign Key
        ALTER TABLE documentos_cliente
        ADD CONSTRAINT fk_documentos_cliente_subido_por
        FOREIGN KEY (subido_por) REFERENCES usuarios(id)
        ON DELETE SET NULL; -- Si se elimina usuario, campo queda null

        RAISE NOTICE '✅ Foreign Key fk_documentos_cliente_subido_por creada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️  Foreign Key fk_documentos_cliente_subido_por ya existe';
    END IF;
END $$;

-- 3. Crear índice para mejorar performance en consultas
CREATE INDEX IF NOT EXISTS idx_documentos_cliente_subido_por
ON documentos_cliente(subido_por);

-- 5. Recrear políticas RLS básicas
CREATE POLICY "Usuarios pueden ver sus propios documentos"
ON documentos_cliente FOR SELECT
USING (auth.uid() = subido_por);

CREATE POLICY "Usuarios pueden insertar documentos"
ON documentos_cliente FOR INSERT
WITH CHECK (auth.uid() = subido_por);

CREATE POLICY "Usuarios pueden actualizar sus documentos"
ON documentos_cliente FOR UPDATE
USING (auth.uid() = subido_por);

CREATE POLICY "Usuarios pueden eliminar sus documentos"
ON documentos_cliente FOR DELETE
USING (auth.uid() = subido_por);

-- 6. Rehabilitar RLS
ALTER TABLE documentos_cliente ENABLE ROW LEVEL SECURITY;

-- 7. Verificación final
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'fk_documentos_cliente_subido_por';
