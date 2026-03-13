-- ================================================
-- DIAGNÓSTICO CRÍTICO: RELACIÓN FUENTES_PAGO
-- ================================================

-- 1. Verificar si existen ambas tablas
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('fuentes_pago', 'tipos_fuentes_pago')
ORDER BY table_name;

-- 2. Verificar structure de fuentes_pago
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'fuentes_pago'
AND column_name IN ('id', 'tipo', 'tipo_fuente_id')
ORDER BY ordinal_position;

-- 3. Verificar structure de tipos_fuentes_pago
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'tipos_fuentes_pago'
AND column_name IN ('id', 'nombre', 'codigo')
ORDER BY ordinal_position;

-- 4. Verificar constraints de FK
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('fuentes_pago', 'tipos_fuentes_pago');

-- 5. Verificar datos actuales en fuentes_pago (tipos únicos)
SELECT DISTINCT tipo
FROM fuentes_pago
WHERE estado_fuente = 'activa'
ORDER BY tipo;

-- 6. Verificar datos en tipos_fuentes_pago
SELECT id, nombre, codigo, orden, activo
FROM tipos_fuentes_pago
WHERE activo = true
ORDER BY orden;
