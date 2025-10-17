-- =====================================================
-- QUERIES DE VERIFICACIÓN - Copiar y Pegar en Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR MIGRACIÓN DE CLIENTES
-- =====================================================

-- Ver cantidad de clientes migrados
SELECT
  (SELECT COUNT(*) FROM clientes) as clientes_nuevos,
  (SELECT COUNT(*) FROM clientes_old) as clientes_antiguos;

-- Ver primeros 5 clientes con nueva estructura
SELECT
  id,
  nombre_completo,
  tipo_documento,
  numero_documento,
  estado,
  origen,
  telefono,
  email
FROM clientes
LIMIT 5;

-- Ver todos los campos de un cliente
SELECT * FROM clientes LIMIT 1;

-- =====================================================
-- 2. VERIFICAR TABLAS CREADAS
-- =====================================================

-- Ver todas las tablas del módulo de clientes/negociaciones
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
  table_name LIKE '%client%'
  OR table_name LIKE '%negoci%'
  OR table_name LIKE '%fuente%'
  OR table_name LIKE '%proceso%'
)
ORDER BY table_name;

-- Debería mostrar:
-- clientes
-- clientes_old (temporal)
-- fuentes_pago
-- negociaciones
-- plantillas_proceso
-- procesos_negociacion
-- vista_clientes_resumen
-- vista_negociaciones_completas

-- =====================================================
-- 3. VERIFICAR ESTRUCTURA DE CLIENTES
-- =====================================================

-- Ver todas las columnas de la tabla clientes
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'clientes'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Debería tener: nombres, apellidos, nombre_completo, tipo_documento,
-- numero_documento, fecha_nacimiento, telefono, email, estado, origen, etc.

-- =====================================================
-- 4. VERIFICAR VISTAS
-- =====================================================

-- Ver vista de clientes con estadísticas
SELECT * FROM vista_clientes_resumen LIMIT 5;

-- Ver estructura de vista de negociaciones (estará vacía por ahora)
SELECT * FROM vista_negociaciones_completas LIMIT 5;

-- =====================================================
-- 5. VERIFICAR ÍNDICES
-- =====================================================

-- Ver índices creados en tabla clientes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'clientes'
AND schemaname = 'public'
ORDER BY indexname;

-- Debería mostrar índices para: estado, numero_documento,
-- nombre_completo, fecha_creacion, email

-- =====================================================
-- 6. VERIFICAR TRIGGERS
-- =====================================================

-- Ver todos los triggers del módulo
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('clientes', 'negociaciones', 'fuentes_pago', 'procesos_negociacion')
ORDER BY event_object_table, trigger_name;

-- Debería mostrar triggers como:
-- trigger_update_negociaciones_fecha_actualizacion
-- trigger_update_negociaciones_totales_insert
-- trigger_update_negociaciones_totales_update
-- trigger_update_cliente_estado_on_negociacion

-- =====================================================
-- 7. VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Ver políticas de Row Level Security aplicadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('clientes', 'negociaciones', 'fuentes_pago', 'procesos_negociacion', 'plantillas_proceso')
ORDER BY tablename, policyname;

-- Cada tabla debería tener 4 políticas (SELECT, INSERT, UPDATE, DELETE)

-- =====================================================
-- 8. VERIFICAR CONSTRAINTS
-- =====================================================

-- Ver constraints (restricciones) de la tabla clientes
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE con.contype
    WHEN 'c' THEN 'CHECK'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    ELSE con.contype::text
  END AS constraint_type_desc
FROM pg_constraint con
JOIN pg_class rel ON con.conrelid = rel.oid
WHERE rel.relname = 'clientes'
AND rel.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY constraint_name;

-- =====================================================
-- 9. VERIFICAR FOREIGN KEYS (Llaves Foráneas)
-- =====================================================

-- Ver relaciones de negociaciones
SELECT
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
AND tc.table_name IN ('negociaciones', 'fuentes_pago', 'procesos_negociacion')
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 10. ESTADÍSTICAS GENERALES
-- =====================================================

-- Resumen completo del módulo
SELECT
  'Clientes' as tabla,
  COUNT(*) as cantidad
FROM clientes
UNION ALL
SELECT
  'Negociaciones' as tabla,
  COUNT(*) as cantidad
FROM negociaciones
UNION ALL
SELECT
  'Fuentes de Pago' as tabla,
  COUNT(*) as cantidad
FROM fuentes_pago
UNION ALL
SELECT
  'Procesos' as tabla,
  COUNT(*) as cantidad
FROM procesos_negociacion
UNION ALL
SELECT
  'Plantillas' as tabla,
  COUNT(*) as cantidad
FROM plantillas_proceso;

-- =====================================================
-- 11. PRUEBA DE INSERCIÓN (OPCIONAL)
-- =====================================================

-- Insertar un cliente de prueba
INSERT INTO clientes (
  nombres,
  apellidos,
  tipo_documento,
  numero_documento,
  telefono,
  email,
  estado,
  origen
) VALUES (
  'Juan',
  'Pérez',
  'CC',
  '1234567890',
  '3001234567',
  'juan.perez@example.com',
  'Interesado',
  'Página Web'
)
RETURNING id, nombre_completo, estado;

-- Si funciona, deberías ver el cliente creado con su ID

-- Para eliminar el cliente de prueba:
-- DELETE FROM clientes WHERE numero_documento = '1234567890';

-- =====================================================
-- 12. VERIFICACIÓN FINAL (TODO EN UNO)
-- =====================================================

-- Este query muestra un resumen completo de todo
SELECT
  'Tablas' as categoria,
  COUNT(*) as cantidad
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('clientes', 'negociaciones', 'fuentes_pago', 'procesos_negociacion', 'plantillas_proceso')

UNION ALL

SELECT
  'Vistas' as categoria,
  COUNT(*) as cantidad
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('vista_clientes_resumen', 'vista_negociaciones_completas')

UNION ALL

SELECT
  'Triggers' as categoria,
  COUNT(*) as cantidad
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('clientes', 'negociaciones', 'fuentes_pago')

UNION ALL

SELECT
  'Políticas RLS' as categoria,
  COUNT(*) as cantidad
FROM pg_policies
WHERE tablename IN ('clientes', 'negociaciones', 'fuentes_pago', 'procesos_negociacion', 'plantillas_proceso')

UNION ALL

SELECT
  'Clientes' as categoria,
  COUNT(*) as cantidad
FROM clientes;

-- Resultados esperados:
-- Tablas: 5
-- Vistas: 2
-- Triggers: 4-5
-- Políticas RLS: 20 (4 por tabla × 5 tablas)
-- Clientes: N (cantidad actual)

-- =====================================================
-- ✅ SI TODO SE VE BIEN, EJECUTA ESTO ÚLTIMO:
-- =====================================================

-- Eliminar tabla antigua (SOLO si todo está OK)
-- DROP TABLE IF EXISTS clientes_old CASCADE;

-- =====================================================
-- 🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!
-- =====================================================
