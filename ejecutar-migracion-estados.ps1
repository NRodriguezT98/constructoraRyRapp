# Script para ejecutar migración de estados de versión
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ejecutando Migración: Estados de Versión" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Migración 1: Sistema de estados de versión
Write-Host "📋 Ejecutando migración 1: sistema_estados_version.sql..." -ForegroundColor Yellow
node ejecutar-sql-supabase.js supabase/migrations/20251115000001_sistema_estados_version.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migración 1 completada" -ForegroundColor Green
} else {
    Write-Host "❌ Error en migración 1" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Migración 2: Metadata JSONB
Write-Host "📋 Ejecutando migración 2: reemplazo_archivo_metadata.sql..." -ForegroundColor Yellow
node ejecutar-sql-supabase.js supabase/migrations/20251115000002_reemplazo_archivo_metadata.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migración 2 completada" -ForegroundColor Green
} else {
    Write-Host "❌ Error en migración 2" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ MIGRACIONES COMPLETADAS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 Regenerando tipos TypeScript..." -ForegroundColor Yellow
npm run types:generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tipos regenerados correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error al regenerar tipos (puede ser normal si husky está corriendo)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Proceso completado. Refresca tu navegador para ver los cambios." -ForegroundColor Green
