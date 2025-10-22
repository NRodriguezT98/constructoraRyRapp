-- =====================================================
-- Verificación COMPLETA del sistema de abonos
-- =====================================================

-- 1️⃣ Verificar que la TABLA existe
SELECT
  'Tabla abonos_historial' as verificacion,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'abonos_historial' AND table_schema = 'public'
    ) THEN '✅ EXISTE'
    ELSE '❌ NO EXISTE'
  END as resultado;

-- 2️⃣ Verificar COLUMNAS de la tabla
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'abonos_historial'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3️⃣ Verificar TODAS las FUNCIONES relacionadas con abonos
SELECT
  routine_name,
  routine_type,
  CASE routine_name
    WHEN 'actualizar_monto_recibido_fuente' THEN '🔄 Auto-actualiza monto_recibido'
    WHEN 'validar_abono_no_excede_saldo' THEN '🛡️ Valida saldo'
    WHEN 'update_abonos_historial_fecha_actualizacion' THEN '📅 Actualiza timestamp'
    ELSE '❓ Otra función'
  END as descripcion
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_name LIKE '%abono%'
    OR routine_name = 'actualizar_monto_recibido_fuente'
  )
ORDER BY routine_name;

-- 4️⃣ Verificar TRIGGERS activos
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'abonos_historial'
  AND trigger_schema = 'public'
ORDER BY trigger_name;

-- 5️⃣ Verificar ÍNDICES creados
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'abonos_historial'
  AND schemaname = 'public'
ORDER BY indexname;

-- 6️⃣ Verificar CONSTRAINTS (CHECK, FK, etc)
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE con.contype
    WHEN 'c' THEN 'CHECK'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    ELSE con.contype::text
  END AS type_description,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'abonos_historial'
  AND nsp.nspname = 'public'
ORDER BY con.contype, con.conname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Tabla: ✅ EXISTE
-- Columnas: 13 filas (id, negociacion_id, fuente_pago_id, monto, fecha_abono, metodo_pago, numero_referencia, comprobante_url, notas, fecha_creacion, fecha_actualizacion, usuario_registro)
-- Funciones: 3 funciones (actualizar_monto_recibido_fuente, validar_abono_no_excede_saldo, update_abonos_historial_fecha_actualizacion)
-- Triggers: 3 triggers (uno por cada función)
-- Índices: 4 índices (negociacion, fuente, fecha, metodo)
-- Constraints: ~5-6 (PK, 2 FK, CHECK monto, CHECK metodo_pago)
