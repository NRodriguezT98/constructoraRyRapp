-- ============================================
-- DIAGNÓSTICO DETALLADO: Fuentes de Pago
-- ============================================

-- 1. Ver triggers activos en fuentes_pago
SELECT
    trigger_name,
    event_manipulation AS evento,
    action_timing AS cuando,
    action_statement AS accion
FROM information_schema.triggers
WHERE event_object_table = 'fuentes_pago'
ORDER BY trigger_name;

-- 2. Ver funciones trigger asociadas
SELECT
    p.proname AS funcion,
    pg_get_functiondef(p.oid) AS definicion_preview
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%fuente%'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- 3. Ver fuentes actuales de la negociación problemática
SELECT
    id,
    tipo,
    monto_aprobado,
    monto_recibido,
    estado_fuente,
    fecha_inactivacion,
    razon_inactivacion,
    reemplazada_por
FROM fuentes_pago
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
ORDER BY
    CASE estado_fuente WHEN 'activa' THEN 1 ELSE 2 END,
    tipo;

-- 4. Ver políticas RLS en fuentes_pago
SELECT
    policyname AS politica,
    cmd AS comando,
    qual AS condicion,
    with_check AS verificacion
FROM pg_policies
WHERE tablename = 'fuentes_pago'
ORDER BY policyname;
