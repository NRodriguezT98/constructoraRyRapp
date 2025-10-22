# 🔍 Script de Validación Post-Migración
# Ejecuta queries de validación directamente desde VS Code

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 🔍 VALIDACIÓN POST-MIGRACIÓN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Estados de todas las tablas
Write-Host " 📊 1. Estados de todas las tablas:" -ForegroundColor Yellow
Write-Host ""
supabase db query @"
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
"@

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# 2. Nuevos campos en viviendas
Write-Host " 📋 2. Nuevos campos en viviendas:" -ForegroundColor Yellow
Write-Host ""
supabase db query @"
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'viviendas'
  AND column_name IN ('negociacion_id', 'fecha_entrega')
ORDER BY column_name;
"@

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# 3. Nuevos campos en negociaciones
Write-Host " 📋 3. Nuevos campos en negociaciones:" -ForegroundColor Yellow
Write-Host ""
supabase db query @"
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'negociaciones'
  AND column_name IN ('fecha_renuncia_efectiva', 'fecha_completada')
ORDER BY column_name;
"@

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# 4. Nuevos campos en renuncias (principales)
Write-Host " 📋 4. Nuevos campos en renuncias (muestra):" -ForegroundColor Yellow
Write-Host ""
supabase db query @"
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
"@

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# 5. Funciones creadas
Write-Host " ⚙️  5. Funciones creadas:" -ForegroundColor Yellow
Write-Host ""
supabase db query @"
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'validar_cancelacion_renuncia',
    'calcular_monto_devolver',
    'obtener_snapshot_abonos'
  )
ORDER BY routine_name;
"@

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# 6. Vistas creadas
Write-Host " 👁️  6. Vistas creadas:" -ForegroundColor Yellow
Write-Host ""
supabase db query @"
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'v_negociaciones_completas',
    'v_renuncias_pendientes'
  )
ORDER BY table_name;
"@

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ✅ VALIDACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " 💡 Para ver más detalles, ejecuta:" -ForegroundColor Yellow
Write-Host "    supabase db query 'SELECT * FROM v_negociaciones_completas LIMIT 5;'" -ForegroundColor Gray
Write-Host ""
