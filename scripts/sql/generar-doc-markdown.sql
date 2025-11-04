-- =====================================================
-- GENERAR DOCUMENTACIÓN MARKDOWN DEL ESQUEMA
-- =====================================================
-- Este script genera el contenido para DATABASE-SCHEMA-REFERENCE.md
-- en formato Markdown listo para copiar

\pset border 0
\pset tuples_only on

-- Por cada tabla, generar su documentación
DO $

$ DECLARE
    tabla_rec RECORD;
    columna_rec RECORD;
    constraint_rec RECORD;
    contador INT := 0;
BEGIN
    -- Iterar sobre cada tabla
    FOR tabla_rec IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        contador := contador + 1;

        -- Encabezado de la tabla
        RAISE NOTICE '';
        RAISE NOTICE '## %. Tabla: `%`', contador, tabla_rec.tablename;
        RAISE NOTICE '';

        -- Descripción (placeholder)
        RAISE NOTICE '**Descripción**: [Agregar descripción de %]', tabla_rec.tablename;
        RAISE NOTICE '';

        -- Columnas
        RAISE NOTICE '### Columnas';
        RAISE NOTICE '';
        RAISE NOTICE '| Columna | Tipo | Nullable | Default | Descripción |';
        RAISE NOTICE '|---------|------|----------|---------|-------------|';

        FOR columna_rec IN
            SELECT
                column_name,
                data_type,
                character_maximum_length,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_name = tabla_rec.tablename
              AND table_schema = 'public'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '| `%` | % | % | % | |',
                columna_rec.column_name,
                CASE
                    WHEN columna_rec.character_maximum_length IS NOT NULL
                    THEN columna_rec.data_type || '(' || columna_rec.character_maximum_length || ')'
                    ELSE columna_rec.data_type
                END,
                columna_rec.is_nullable,
                COALESCE(columna_rec.column_default, '-');
        END LOOP;

        RAISE NOTICE '';

        -- Constraints
        RAISE NOTICE '### Constraints';
        RAISE NOTICE '';

        FOR constraint_rec IN
            SELECT DISTINCT
                tc.constraint_name,
                tc.constraint_type
            FROM information_schema.table_constraints tc
            WHERE tc.table_name = tabla_rec.tablename
              AND tc.table_schema = 'public'
            ORDER BY tc.constraint_type, tc.constraint_name
        LOOP
            RAISE NOTICE '- **%**: %',
                constraint_rec.constraint_type,
                constraint_rec.constraint_name;
        END LOOP;

        RAISE NOTICE '';
        RAISE NOTICE '---';
        RAISE NOTICE '';
    END LOOP;
END;
$$;
