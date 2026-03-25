-- Diagnóstico completo del flujo de registrar_renuncia_completa

-- 1. Constraints actuales en audit_log
SELECT 'CONSTRAINT valid_accion:' as info,
       pg_get_constraintdef(oid) as definicion
FROM pg_constraint
WHERE conname = 'valid_accion';

-- 2. Triggers activos en la tabla renuncias
SELECT 'TRIGGER en renuncias:' as info,
       trigger_name,
       event_manipulation,
       action_timing,
       action_statement
FROM information_schema.triggers
WHERE event_object_table = 'renuncias'
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- 3. Triggers activos en negociaciones
SELECT 'TRIGGER en negociaciones:' as info,
       trigger_name,
       event_manipulation,
       action_timing
FROM information_schema.triggers
WHERE event_object_table = 'negociaciones'
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- 4. Triggers activos en viviendas
SELECT 'TRIGGER en viviendas:' as info,
       trigger_name,
       event_manipulation,
       action_timing
FROM information_schema.triggers
WHERE event_object_table = 'viviendas'
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- 5. Constraints en renuncias
SELECT 'CONSTRAINT renuncias:' as info,
       conname,
       pg_get_constraintdef(oid) as definicion
FROM pg_constraint
WHERE conrelid = 'renuncias'::regclass
ORDER BY conname;

-- 6. Constraints en negociaciones relevantes
SELECT 'CONSTRAINT negociaciones:' as info,
       conname,
       pg_get_constraintdef(oid) as definicion
FROM pg_constraint
WHERE conrelid = 'negociaciones'::regclass
  AND conname LIKE '%estado%'
ORDER BY conname;

-- 7. Verificar columna usuario_email en audit_log (NOT NULL?)
SELECT 'audit_log usuario_email:' as info,
       column_name,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_name = 'audit_log'
  AND column_name = 'usuario_email';

-- 8. Cuerpo actual de la función audit_trigger_func
SELECT 'audit_trigger_func body:' as info,
       prosrc
FROM pg_proc
WHERE proname = 'audit_trigger_func';
