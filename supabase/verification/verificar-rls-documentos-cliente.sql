-- ============================================
-- VERIFICAR RLS Y POLÍTICAS EN documentos_cliente
-- ============================================

-- 1. Verificar si RLS está habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity AS "RLS Habilitado"
FROM pg_tables
WHERE tablename = 'documentos_cliente';

-- 2. Listar todas las políticas activas
SELECT
    schemaname,
    tablename,
    policyname AS "Nombre Política",
    permissive AS "Permisiva",
    roles AS "Roles",
    cmd AS "Comando (SELECT/INSERT/UPDATE/DELETE/ALL)",
    qual AS "Condición USING",
    with_check AS "Condición WITH CHECK"
FROM pg_policies
WHERE tablename = 'documentos_cliente'
ORDER BY policyname;

-- 3. Verificar función is_admin()
SELECT
    proname AS "Nombre Función",
    prosecdef AS "SECURITY DEFINER",
    provolatile AS "Volatilidad",
    proisstrict AS "Strict",
    pg_get_functiondef(oid) AS "Definición Completa"
FROM pg_proc
WHERE proname = 'is_admin';

-- 4. Probar función is_admin() con usuario actual
SELECT is_admin() AS "Usuario actual es admin?";

-- 5. Verificar constraint FK subido_por → usuarios
SELECT
    tc.constraint_name AS "Nombre Constraint",
    tc.table_name AS "Tabla",
    kcu.column_name AS "Columna",
    ccu.table_name AS "Tabla Referenciada",
    ccu.column_name AS "Columna Referenciada"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'documentos_cliente'
    AND kcu.column_name = 'subido_por';

-- 6. Verificar tipo de dato de subido_por
SELECT
    column_name AS "Columna",
    data_type AS "Tipo de Dato",
    udt_name AS "UDT Name",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_name = 'documentos_cliente'
    AND column_name = 'subido_por';

-- 7. Contar documentos eliminados (debería mostrar 3)
SELECT COUNT(*) AS "Total Documentos Eliminados"
FROM documentos_cliente
WHERE estado = 'Eliminado'
    AND es_version_actual = true;
