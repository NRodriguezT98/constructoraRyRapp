-- =====================================================
-- VALIDACIÓN POST-MIGRACIÓN
-- =====================================================
-- Ejecutar estas queries en Supabase SQL Editor para verificar
-- que las migraciones se aplicaron correctamente

-- 1. Verificar estados de todas las tablas
SELECT 'clientes' as tabla, estado, COUNT(*) as cantidad
FROM clientes GROUP BY estado
UNION ALL
SELECT 'viviendas', estado, COUNT(*)
FROM viviendas GROUP BY estado
UNION ALL
SELECT 'negociaciones', estado, COUNT(*)
FROM negociaciones GROUP BY estado
UNION ALL
SELECT 'renuncias', estado, COUNT(*)
FROM renuncias GROUP BY estado
ORDER BY tabla, estado;

-- 2. Verificar nuevos campos agregados en viviendas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'viviendas'
  AND column_name IN ('negociacion_id', 'fecha_entrega')
ORDER BY column_name;

-- 3. Verificar nuevos campos agregados en negociaciones
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'negociaciones'
  AND column_name IN ('fecha_renuncia_efectiva', 'fecha_completada')
ORDER BY column_name;

-- 4. Verificar nuevos campos agregados en renuncias
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'renuncias'
  AND column_name IN (
    'negociacion_id',
    'vivienda_valor_snapshot',
    'abonos_snapshot',
    'requiere_devolucion',
    'monto_a_devolver',
    'fecha_devolucion',
    'comprobante_devolucion_url',
    'metodo_devolucion',
    'numero_comprobante',
    'fecha_cancelacion',
    'motivo_cancelacion',
    'usuario_cancelacion',
    'fecha_cierre',
    'usuario_registro',
    'usuario_cierre'
  )
ORDER BY column_name;

-- 5. Verificar triggers creados
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE 'trigger_%'
ORDER BY event_object_table, trigger_name;

-- 6. Verificar funciones creadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'validar_cancelacion_renuncia',
    'calcular_monto_devolver',
    'obtener_snapshot_abonos'
  )
ORDER BY routine_name;

-- 7. Verificar vistas creadas
SELECT table_name, view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'v_negociaciones_completas',
    'v_renuncias_pendientes'
  )
ORDER BY table_name;

-- 8. Verificar constraints de integridad
SELECT
  tc.constraint_name,
  tc.table_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('clientes', 'viviendas', 'negociaciones', 'renuncias')
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- RESULTADOS ESPERADOS:
-- =====================================================

-- ✅ Estados de clientes: Interesado, Activo, En Proceso de Renuncia, Inactivo, Propietario
-- ✅ Estados de viviendas: Disponible, Asignada, Entregada
-- ✅ Estados de negociaciones: Activa, Suspendida, Cerrada por Renuncia, Completada
-- ✅ Estados de renuncias: Pendiente Devolución, Cerrada, Cancelada

-- ✅ Nuevos campos en viviendas: negociacion_id, fecha_entrega
-- ✅ Nuevos campos en negociaciones: fecha_renuncia_efectiva, fecha_completada
-- ✅ Nuevos campos en renuncias: 15+ campos nuevos

-- ✅ Trigger: trigger_calcular_monto_devolver (automático)
-- ✅ Función: validar_cancelacion_renuncia (validación manual)
-- ✅ Función: calcular_monto_devolver (usada por trigger)
-- ✅ Función: obtener_snapshot_abonos (helper)

-- ✅ Vistas: v_negociaciones_completas, v_renuncias_pendientes

-- =====================================================
-- SI TODO ESTÁ CORRECTO:
-- =====================================================
-- 1. Actualizar DATABASE-SCHEMA-REFERENCE.md
-- 2. Actualizar tipos TypeScript en el código
-- 3. Actualizar componentes UI (badges, filtros, selects de estado)
-- 4. Probar flujos completos en la aplicación
