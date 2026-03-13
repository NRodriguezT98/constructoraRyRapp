-- ============================================
-- DIAGNÓSTICO: Estado actual de fuentes_pago
-- ============================================

\echo '\n====== FUENTES DE LA NEGOCIACIÓN ======'
SELECT
    id::text as id_corto,
    tipo,
    monto_aprobado,
    monto_recibido,
    estado_fuente,
    fecha_inactivacion::date,
    COALESCE(SUBSTRING(razon_inactivacion, 1, 50), '-') as razon
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
ORDER BY
    CASE estado_fuente WHEN 'activa' THEN 1 ELSE 2 END,
    tipo;

\echo '\n====== TRIGGERS ACTIVOS ======'
SELECT
    trigger_name,
    event_manipulation AS evento,
    action_timing AS cuando
FROM information_schema.triggers
WHERE event_object_table = 'fuentes_pago'
ORDER BY trigger_name;

\echo '\n====== POLÍTICAS RLS ======'
SELECT
    policyname AS politica,
    cmd AS comando
FROM pg_policies
WHERE tablename = 'fuentes_pago'
ORDER BY cmd, policyname;
