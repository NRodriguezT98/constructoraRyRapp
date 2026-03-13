-- ================================================
-- MIGRACIÓN ROBUSTA: FUENTES_PAGO FK CON UUID
-- ================================================
--
-- OBJETIVO: Cambiar de texto libre a FK robusta con UUID
-- ANTES:   fuentes_pago.tipo = VARCHAR (texto libre)
-- DESPUÉS: fuentes_pago.tipo_fuente_id = UUID FK
--
-- FASES:
-- 1. Agregar nueva columna (nullable temporal)
-- 2. Migrar datos existentes automáticamente
-- 3. Validar migración (0 pérdidas)
-- 4. Hacer columna NOT NULL
-- 5. Crear FK robusta
-- 6. Crear índice para rendimiento
-- ================================================

-- ==========================================
-- FASE 1: AGREGAR NUEVA COLUMNA
-- ==========================================

DO $$
BEGIN
    -- Verificar si la columna ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'fuentes_pago'
        AND column_name = 'tipo_fuente_id'
    ) THEN
        ALTER TABLE fuentes_pago
        ADD COLUMN tipo_fuente_id UUID;

        RAISE NOTICE '✅ Columna tipo_fuente_id agregada';
    ELSE
        RAISE NOTICE '⚠️ Columna tipo_fuente_id ya existe, saltando...';
    END IF;
END
$$;

-- ==========================================
-- FASE 2: MIGRAR DATOS EXISTENTES
-- ==========================================

DO $$
DECLARE
    total_registros INTEGER;
    registros_migrados INTEGER;
BEGIN
    -- Contar total de registros
    SELECT COUNT(*) INTO total_registros FROM fuentes_pago;
    RAISE NOTICE '📊 Total de fuentes_pago: %', total_registros;

    -- Migrar datos: tipo (string) -> tipo_fuente_id (UUID)
    UPDATE fuentes_pago
    SET tipo_fuente_id = tipos_fuentes_pago.id
    FROM tipos_fuentes_pago
    WHERE fuentes_pago.tipo = tipos_fuentes_pago.nombre
    AND fuentes_pago.tipo_fuente_id IS NULL;

    -- Verificar migración
    SELECT COUNT(*) INTO registros_migrados
    FROM fuentes_pago
    WHERE tipo_fuente_id IS NOT NULL;

    RAISE NOTICE '✅ Registros migrados: %/%', registros_migrados, total_registros;

    -- Verificar si hay registros sin migrar
    IF registros_migrados < total_registros THEN
        RAISE NOTICE '⚠️ Hay % registros sin migrar', (total_registros - registros_migrados);

        -- Mostrar tipos que no tienen match
        RAISE NOTICE '🔍 Tipos sin match en tipos_fuentes_pago:';
        DECLARE
            tipo_sin_match TEXT;
        BEGIN
            FOR tipo_sin_match IN (
                SELECT DISTINCT tipo
                FROM fuentes_pago
                WHERE tipo_fuente_id IS NULL
            )
            LOOP
                RAISE NOTICE '   - %', tipo_sin_match;
            END LOOP;
        END;
    END IF;
END
$$;

-- ==========================================
-- FASE 3: VALIDACIONES CRÍTICAS
-- ==========================================

DO $$
DECLARE
    registros_null INTEGER;
    registros_huerfanos INTEGER;
BEGIN
    -- Verificar que no hay NULLs
    SELECT COUNT(*) INTO registros_null
    FROM fuentes_pago
    WHERE tipo_fuente_id IS NULL;

    IF registros_null > 0 THEN
        RAISE EXCEPTION '❌ MIGRACIÓN FALLÓ: % registros con tipo_fuente_id NULL', registros_null;
    END IF;

    -- Verificar que todos los UUIDs son válidos
    SELECT COUNT(*) INTO registros_huerfanos
    FROM fuentes_pago f
    LEFT JOIN tipos_fuentes_pago t ON f.tipo_fuente_id = t.id
    WHERE t.id IS NULL;

    IF registros_huerfanos > 0 THEN
        RAISE EXCEPTION '❌ MIGRACIÓN FALLÓ: % registros con UUIDs inválidos', registros_huerfanos;
    END IF;

    RAISE NOTICE '✅ VALIDACIÓN EXITOSA: Todos los datos migrados correctamente';
END
$$;

-- ==========================================
-- FASE 4: HACER COLUMNA NOT NULL
-- ==========================================

DO $$
BEGIN
    ALTER TABLE fuentes_pago
    ALTER COLUMN tipo_fuente_id SET NOT NULL;

    RAISE NOTICE '✅ Columna tipo_fuente_id ahora es NOT NULL';
END
$$;

-- ==========================================
-- FASE 5: CREAR FK ROBUSTA
-- ==========================================

DO $$
BEGIN
    -- Verificar si FK ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_fuentes_pago_tipo_fuente'
        AND table_name = 'fuentes_pago'
    ) THEN
        ALTER TABLE fuentes_pago
        ADD CONSTRAINT fk_fuentes_pago_tipo_fuente
        FOREIGN KEY (tipo_fuente_id) REFERENCES tipos_fuentes_pago(id);

        RAISE NOTICE '✅ Foreign Key fk_fuentes_pago_tipo_fuente creada';
    ELSE
        RAISE NOTICE '⚠️ Foreign Key ya existe, saltando...';
    END IF;
END
$$;

-- ==========================================
-- FASE 6: CREAR ÍNDICE PARA RENDIMIENTO
-- ==========================================

DO $$
BEGIN
    -- Crear índice si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'fuentes_pago'
        AND indexname = 'idx_fuentes_pago_tipo_fuente_id'
    ) THEN
        CREATE INDEX idx_fuentes_pago_tipo_fuente_id
        ON fuentes_pago(tipo_fuente_id);

        RAISE NOTICE '✅ Índice idx_fuentes_pago_tipo_fuente_id creado';
    ELSE
        RAISE NOTICE '⚠️ Índice ya existe, saltando...';
    END IF;
END
$$;

-- ==========================================
-- RESUMEN FINAL
-- ==========================================

DO $$
DECLARE
    total_fuentes INTEGER;
    total_tipos INTEGER;
    fk_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO total_fuentes FROM fuentes_pago;
    SELECT COUNT(*) INTO total_tipos FROM tipos_fuentes_pago WHERE activo = true;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_fuentes_pago_tipo_fuente'
    ) INTO fk_exists;

    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '================================================';
    RAISE NOTICE '📊 Fuentes de pago migradas: %', total_fuentes;
    RAISE NOTICE '📊 Tipos disponibles: %', total_tipos;
    RAISE NOTICE '🔗 Foreign Key creada: %', CASE WHEN fk_exists THEN 'SÍ' ELSE 'NO' END;
    RAISE NOTICE '✅ Estado: ROBUSTO Y CONSISTENTE';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Próximo paso: Actualizar código TypeScript';
    RAISE NOTICE '================================================';
END
$$;
