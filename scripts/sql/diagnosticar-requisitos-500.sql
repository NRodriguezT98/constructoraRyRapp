-- ============================================================
-- DIAGNÓSTICO: Error 500 en PATCH requisitos_fuentes_pago_config
-- ============================================================

-- 1. Verificar que la columna fuentes_aplicables existe
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'requisitos_fuentes_pago_config'
ORDER BY ordinal_position;

-- 2. Ver triggers activos en la tabla
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'requisitos_fuentes_pago_config';

-- 3. Ver políticas RLS activas
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'requisitos_fuentes_pago_config';

-- 4. Verificar que la vista se creó correctamente
SELECT count(*) as vista_ok
FROM information_schema.views
WHERE table_name = 'vista_documentos_pendientes_fuentes';

-- 5. Intentar actualizar el registro que falla para ver el error real
-- (id del registro del error: 1f351679-f0b9-4c6e-b818-db20cc869f83)
UPDATE requisitos_fuentes_pago_config
SET fecha_actualizacion = NOW()
WHERE id = '1f351679-f0b9-4c6e-b818-db20cc869f83'
RETURNING id, titulo, fuentes_aplicables;

-- 6. Forzar reload del schema cache de PostgREST
NOTIFY pgrst, 'reload schema';
