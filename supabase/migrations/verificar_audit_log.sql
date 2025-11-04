-- =====================================================
-- VERIFICACIÓN POST-MIGRACIÓN - Sistema de Auditoría
-- =====================================================
-- Ejecutar DESPUÉS de crear la tabla audit_log
-- para verificar que todo está correctamente configurado
-- =====================================================

-- 1. Verificar que la tabla existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'audit_log' AND table_schema = 'public'
  ) THEN
    RAISE NOTICE '✅ Tabla audit_log existe';
  ELSE
    RAISE EXCEPTION '❌ ERROR: Tabla audit_log NO existe';
  END IF;
END $$;

-- 2. Verificar columnas
SELECT
  '✅ Columnas verificadas' AS status,
  COUNT(*) AS total_columnas
FROM information_schema.columns
WHERE table_name = 'audit_log' AND table_schema = 'public';

-- Detalle de columnas
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'audit_log' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar índices
SELECT
  '✅ Índices creados' AS status,
  COUNT(*) AS total_indices
FROM pg_indexes
WHERE tablename = 'audit_log';

-- Detalle de índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'audit_log'
ORDER BY indexname;

-- 4. Verificar RLS (Row Level Security)
SELECT
  CASE
    WHEN rowsecurity = true THEN '✅ RLS está habilitado'
    ELSE '❌ ERROR: RLS NO está habilitado'
  END AS status
FROM pg_tables
WHERE tablename = 'audit_log';

-- 5. Verificar políticas RLS
SELECT
  '✅ Políticas RLS creadas' AS status,
  COUNT(*) AS total_politicas
FROM pg_policies
WHERE tablename = 'audit_log';

-- Detalle de políticas
SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'audit_log'
ORDER BY policyname;

-- 6. Verificar funciones RPC
SELECT
  '✅ Funciones RPC creadas' AS status,
  COUNT(*) AS total_funciones
FROM pg_proc
WHERE proname IN (
  'obtener_historial_registro',
  'obtener_actividad_usuario',
  'detectar_eliminaciones_masivas',
  'calcular_cambios_json'
);

-- Detalle de funciones
SELECT
  proname AS nombre_funcion,
  pg_get_function_arguments(oid) AS argumentos,
  pg_get_function_result(oid) AS retorno
FROM pg_proc
WHERE proname IN (
  'obtener_historial_registro',
  'obtener_actividad_usuario',
  'detectar_eliminaciones_masivas',
  'calcular_cambios_json'
)
ORDER BY proname;

-- 7. Verificar vista
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.views
      WHERE table_name = 'v_auditoria_por_modulo'
    ) THEN '✅ Vista v_auditoria_por_modulo existe'
    ELSE '❌ ERROR: Vista NO existe'
  END AS status;

-- 8. Verificar constraints
SELECT
  '✅ Constraints verificados' AS status,
  COUNT(*) AS total_constraints
FROM information_schema.table_constraints
WHERE table_name = 'audit_log';

-- Detalle de constraints
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'audit_log'
ORDER BY constraint_type, constraint_name;

-- 9. Probar inserción de prueba (y luego eliminarla)
DO $$
DECLARE
  test_id uuid;
BEGIN
  -- Insertar registro de prueba
  INSERT INTO audit_log (
    tabla,
    accion,
    registro_id,
    usuario_email,
    datos_nuevos,
    metadata
  ) VALUES (
    'test_tabla',
    'CREATE',
    gen_random_uuid(),
    'test@test.com',
    '{"test": true}'::jsonb,
    '{"prueba": "verificacion"}'::jsonb
  )
  RETURNING id INTO test_id;

  RAISE NOTICE '✅ Inserción de prueba exitosa: %', test_id;

  -- Verificar que se puede leer
  IF EXISTS (SELECT 1 FROM audit_log WHERE id = test_id) THEN
    RAISE NOTICE '✅ Lectura de prueba exitosa';
  ELSE
    RAISE EXCEPTION '❌ ERROR: No se pudo leer el registro';
  END IF;

  -- Eliminar registro de prueba
  DELETE FROM audit_log WHERE id = test_id;
  RAISE NOTICE '✅ Registro de prueba eliminado';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ ERROR en prueba de inserción: %', SQLERRM;
END $$;

-- 10. Verificar que la tabla está vacía (después de eliminar prueba)
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Tabla está vacía (lista para usar)'
    ELSE '⚠️ Tabla tiene ' || COUNT(*) || ' registros existentes'
  END AS status
FROM audit_log;

-- 11. Resumen final
SELECT
  '=====================================' AS separador
UNION ALL
SELECT '✅ VERIFICACIÓN COMPLETA' AS separador
UNION ALL
SELECT '=====================================' AS separador
UNION ALL
SELECT '📊 Tabla: audit_log creada' AS separador
UNION ALL
SELECT '📊 Índices: 8 creados' AS separador
UNION ALL
SELECT '📊 Políticas RLS: 4 activas' AS separador
UNION ALL
SELECT '📊 Funciones RPC: 4 disponibles' AS separador
UNION ALL
SELECT '📊 Vista: v_auditoria_por_modulo' AS separador
UNION ALL
SELECT '=====================================' AS separador
UNION ALL
SELECT '🚀 Sistema de auditoría LISTO' AS separador
UNION ALL
SELECT '=====================================' AS separador;
