# Script para ejecutar migración: Agregar columna documento_identidad_titulo
# Este script te ayuda a copiar el SQL al portapapeles para ejecutarlo en Supabase

Write-Host "🔧 MIGRACIÓN: Agregar columna documento_identidad_titulo" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

$sqlFile = "supabase\migrations\add_documento_identidad_titulo.sql"

if (Test-Path $sqlFile) {
    $sqlContent = Get-Content $sqlFile -Raw

    Write-Host "✅ SQL cargado desde: $sqlFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 CONTENIDO:" -ForegroundColor Yellow
    Write-Host "-" * 60 -ForegroundColor Gray
    Write-Host $sqlContent -ForegroundColor White
    Write-Host "-" * 60 -ForegroundColor Gray
    Write-Host ""

    # Copiar al portapapeles
    Set-Clipboard -Value $sqlContent
    Write-Host "📋 ¡SQL COPIADO AL PORTAPAPELES!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 PASOS SIGUIENTES:" -ForegroundColor Cyan
    Write-Host "1. Ve a: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "2. Abre tu proyecto: swyjhwgvkfcfdtemkyad" -ForegroundColor White
    Write-Host "3. SQL Editor → New Query" -ForegroundColor White
    Write-Host "4. Pega (Ctrl+V) el SQL que está en tu portapapeles" -ForegroundColor White
    Write-Host "5. Click 'Run' o presiona Ctrl+Enter" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ VERIFICACIÓN (ejecuta esto después de migrar):" -ForegroundColor Yellow
    Write-Host "SELECT column_name, data_type, is_nullable" -ForegroundColor Gray
    Write-Host "FROM information_schema.columns" -ForegroundColor Gray
    Write-Host "WHERE table_name = 'clientes'" -ForegroundColor Gray
    Write-Host "  AND column_name = 'documento_identidad_titulo';" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ ERROR: No se encontró el archivo: $sqlFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
