# =====================================================
# Script para aplicar políticas RLS a configuracion_recargos
# =====================================================

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Aplicando políticas RLS a configuracion_recargos" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Leer el archivo SQL
$sqlPath = ".\supabase\migrations\configuracion_recargos_rls.sql"

if (-not (Test-Path $sqlPath)) {
    Write-Host "❌ Error: No se encontró el archivo SQL en:" -ForegroundColor Red
    Write-Host "   $sqlPath" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "📄 Leyendo archivo SQL..." -ForegroundColor Yellow
$sql = Get-Content $sqlPath -Raw
Write-Host "✅ Archivo SQL leído correctamente" -ForegroundColor Green
Write-Host ""

# Pedir confirmación
Write-Host "⚠️  Este script aplicará las siguientes políticas RLS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. SELECT  - Todos los usuarios autenticados pueden leer" -ForegroundColor White
Write-Host "   2. INSERT  - Solo administradores pueden crear" -ForegroundColor White
Write-Host "   3. UPDATE  - Solo administradores pueden actualizar" -ForegroundColor White
Write-Host "   4. DELETE  - Solo administradores pueden eliminar" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "¿Deseas continuar? (S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host ""
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Red
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "🚀 Aplicando políticas RLS..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar SQL en Supabase
# NOTA: Debes ejecutar este SQL manualmente en el SQL Editor de Supabase
# o usar la CLI de Supabase

Write-Host "📋 INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ve a Supabase Dashboard → SQL Editor" -ForegroundColor White
Write-Host "2. Copia y pega el contenido de:" -ForegroundColor White
Write-Host "   $sqlPath" -ForegroundColor Yellow
Write-Host "3. Ejecuta el script" -ForegroundColor White
Write-Host ""
Write-Host "O si tienes Supabase CLI instalado:" -ForegroundColor Cyan
Write-Host "   supabase db push" -ForegroundColor Yellow
Write-Host ""

# Copiar SQL al portapapeles (si está disponible)
try {
    $sql | Set-Clipboard
    Write-Host "✅ SQL copiado al portapapeles!" -ForegroundColor Green
    Write-Host "   Puedes pegarlo directamente en Supabase SQL Editor" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "⚠️  No se pudo copiar al portapapeles" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
