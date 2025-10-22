-- Query 1: Estados de todas las tablas
\echo '📊 1. Estados de todas las tablas:'
\echo ''
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

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Query 2: Nuevos campos en viviendas
\echo '📋 2. Nuevos campos en viviendas:'
\echo ''
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'viviendas'
  AND column_name IN ('negociacion_id', 'fecha_entrega')
ORDER BY column_name;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Query 3: Nuevos campos en negociaciones
\echo '📋 3. Nuevos campos en negociaciones:'
\echo ''
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'negociaciones'
  AND column_name IN ('fecha_renuncia_efectiva', 'fecha_completada')
ORDER BY column_name;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Query 4: Nuevos campos en renuncias
\echo '📋 4. Nuevos campos en renuncias (muestra):'
\echo ''
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'renuncias'
  AND column_name IN (
    'negociacion_id',
    'monto_a_devolver',
    'requiere_devolucion',
    'fecha_devolucion',
    'metodo_devolucion'
  )
ORDER BY column_name;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Query 5: Funciones creadas
\echo '⚙️ 5. Funciones creadas:'
\echo ''
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'validar_cancelacion_renuncia',
    'calcular_monto_devolver',
    'obtener_snapshot_abonos'
  )
ORDER BY routine_name;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Query 6: Vistas creadas
\echo '👁️ 6. Vistas creadas:'
\echo ''
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'v_negociaciones_completas',
    'v_renuncias_pendientes'
  )
ORDER BY table_name;

\echo ''
\echo '✅ VALIDACIÓN COMPLETADA'
\echo ''
